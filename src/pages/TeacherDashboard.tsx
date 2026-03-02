import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Upload, X, ChevronDown, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Course, Field, COURSE_LEVELS } from '../lib/supabase';

export function TeacherDashboard() {
  const { teacher } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    field_ids: [] as string[],
    level: 'Licence 1',
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [fieldSearch, setFieldSearch] = useState('');
  const [openFieldsDropdown, setOpenFieldsDropdown] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fieldsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!teacher) {
      window.history.pushState({}, '', '/teacher/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    loadData();
  }, [teacher]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fieldsDropdownRef.current && !fieldsDropdownRef.current.contains(event.target as Node)) {
        setOpenFieldsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    if (!teacher) return;

    setLoading(true);
    try {
      const { data: fieldsData } = await supabase
        .from('fields')
        .select('*')
        .order('name');

      const { data: coursesData } = await supabase
        .from('courses')
        .select(`
          *,
          teacher:teachers(*),
          course_fields(
            id,
            field_id,
            field:fields(*)
          )
        `)
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false });

      if (fieldsData) setFields(fieldsData);
      if (coursesData) setCourses(coursesData);
    } catch (error) {
      showMessage('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      const fieldIds = course.course_fields?.map((cf: any) => cf.field_id) || [];
      setFormData({
        title: course.title,
        description: course.description,
        field_ids: fieldIds,
        level: course.level,
        file: null,
      });
      setSelectedFileName(course.file_name || null);
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        field_ids: [],
        level: 'Licence 1',
        file: null,
      });
      setSelectedFileName(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      field_ids: [],
      level: 'Licence 1',
      file: null,
    });
    setSelectedFileName(null);
    setFieldSearch('');
    setOpenFieldsDropdown(false);
  };

  const getFileType = (file: File): string => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (['doc', 'docx'].includes(ext || '')) return 'Word';
    if (['ppt', 'pptx'].includes(ext || '')) return 'PowerPoint';
    if (['xls', 'xlsx'].includes(ext || '')) return 'Excel';
    return 'Autre';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;

    setUploading(true);

    try {
      let fileUrl = editingCourse?.file_url || '';
      let fileName = editingCourse?.file_name || '';
      let fileType = editingCourse?.file_type || '';

      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const filePath = `${teacher.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('courses')
          .upload(filePath, formData.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('courses')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = formData.file.name;
        fileType = getFileType(formData.file);
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        level: formData.level,
        teacher_id: teacher.id,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
      };

      let courseId = editingCourse?.id;

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) throw error;

        await supabase
          .from('course_fields')
          .delete()
          .eq('course_id', editingCourse.id);
      } else {
        const { data: newCourse, error } = await supabase
          .from('courses')
          .insert([courseData])
          .select()
          .single();

        if (error) throw error;
        courseId = newCourse.id;
      }

      if (courseId && formData.field_ids.length > 0) {
        const courseFieldsData = formData.field_ids.map(fieldId => ({
          course_id: courseId,
          field_id: fieldId,
        }));

        const { error: cfError } = await supabase
          .from('course_fields')
          .insert(courseFieldsData);

        if (cfError) throw cfError;
      }

      showMessage('success', editingCourse ? 'Cours modifié avec succès' : 'Cours ajouté avec succès');

      handleCloseModal();
      loadData();
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'enregistrement du cours');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      showMessage('success', 'Cours supprimé avec succès');
      loadData();
    } catch (error) {
      showMessage('error', 'Erreur lors de la suppression du cours');
    }
  };

  if (!teacher) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Mes Cours
            </h1>
            <p className="text-slate-600 mt-2">
              Bienvenue, {teacher.name}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un cours</span>
          </button>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
            {message.text}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Aucun cours
            </h3>
            <p className="text-slate-500 mb-6">
              Commencez par ajouter votre premier cours
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter un cours</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
                      {course.course_fields?.map((cf) => (
                        <span key={cf.id} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          {cf.field?.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(course)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  <div className="space-y-1 text-sm text-slate-600">
                    <div>Niveau: {course.level}</div>
                    <div>Format: {course.file_type}</div>
                    <div>Ajouté le: {new Date(course.created_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingCourse ? 'Modifier le cours' : 'Ajouter un cours'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Titre du cours *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div ref={fieldsDropdownRef} className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filières * (sélectionnez une ou plusieurs)
                </label>

                {/* Selected tags */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {formData.field_ids.map((fieldId) => {
                    const field = fields.find(f => f.id === fieldId);
                    return (
                      <span key={fieldId} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full flex items-center gap-2">
                        {field?.name}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, field_ids: formData.field_ids.filter(id => id !== fieldId) })}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Dropdown button and search */}
                <button
                  type="button"
                  onClick={() => setOpenFieldsDropdown(!openFieldsDropdown)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-700">
                    {formData.field_ids.length === 0 ? 'Sélectionner des filières...' : `${formData.field_ids.length} filière(s) sélectionnée(s)`}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFieldsDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {openFieldsDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                    <div className="p-3 border-b border-slate-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Rechercher une filière..."
                          value={fieldSearch}
                          onChange={(e) => setFieldSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 p-2">
                      {fields
                        .filter((field) => field.name.toLowerCase().includes(fieldSearch.toLowerCase()))
                        .map((field) => (
                          <label key={field.id} className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.field_ids.includes(field.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, field_ids: [...formData.field_ids, field.id] });
                                } else {
                                  setFormData({ ...formData, field_ids: formData.field_ids.filter(id => id !== field.id) });
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-slate-700">{field.name}</span>
                          </label>
                        ))}
                      {fields.filter((field) => field.name.toLowerCase().includes(fieldSearch.toLowerCase())).length === 0 && (
                        <p className="text-sm text-slate-500 p-2 text-center">Aucune filière trouvée</p>
                      )}
                    </div>
                  </div>
                )}

                {formData.field_ids.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">Veuillez sélectionner au moins une filière</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Niveau *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {COURSE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fichier {!editingCourse && '*'}
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData({ ...formData, file });
                    if (file) {
                      setSelectedFileName(file.name);
                    }
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingCourse}
                />
                <p className="text-sm text-slate-500 mt-2">
                  Formats acceptés: PDF, Word, PowerPoint, Excel
                </p>
                {selectedFileName && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Fichier actuel:</span> {selectedFileName}
                    </p>
                    {!formData.file && editingCourse && (
                      <p className="text-xs text-blue-600 mt-1">
                        Laissez vide pour conserver ce fichier ou sélectionnez un nouveau
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => handleCloseModal()}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading || formData.field_ids.length === 0}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
