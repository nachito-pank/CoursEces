import { useState, useEffect } from 'react';
import { Search, Download, FileText, Filter, GraduationCap, Calendar, User } from 'lucide-react';
import { supabase, Course, Field, COURSE_LEVELS } from '../lib/supabase';

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
        .order('created_at', { ascending: false });

      if (fieldsData) setFields(fieldsData);
      if (coursesData) setCourses(coursesData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const courseFieldNames = course.course_fields?.map(cf => cf.field?.name || '').join(' ') || '';

    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseFieldNames.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesField = !selectedField ||
      course.course_fields?.some(cf => cf.field_id === selectedField);

    const matchesLevel = !selectedLevel || course.level === selectedLevel;

    return matchesSearch && matchesField && matchesLevel;
  });

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('powerpoint') || type.includes('ppt')) return '📊';
    if (type.includes('excel') || type.includes('xls')) return '📈';
    return '📁';
  };

  const getFileTypeColor = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return 'bg-red-100 text-red-700';
    if (type.includes('word') || type.includes('doc')) return 'bg-blue-100 text-blue-700';
    if (type.includes('powerpoint') || type.includes('ppt')) return 'bg-orange-100 text-orange-700';
    if (type.includes('excel') || type.includes('xls')) return 'bg-green-100 text-green-700';
    return 'bg-slate-100 text-slate-700';
  };

  const handleDownload = async (course: Course) => {
    try {
      const link = document.createElement('a');
      link.href = course.file_url;
      link.download = course.file_name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Bibliothèque de Cours
          </h1>
          <p className="text-slate-600 mb-6">
            Explorez notre collection de ressources pédagogiques
          </p>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4 border border-slate-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, enseignant ou filière..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-48 relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer transition-all"
                  >
                    <option value="">Toutes les filières</option>
                    {fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:w-48 relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer transition-all"
                  >
                    <option value="">Tous les niveaux</option>
                    {COURSE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="text-sm text-slate-600 font-medium">
                {filteredCourses.length} cours {filteredCourses.length > 1 ? 'trouvés' : 'trouvé'}
              </div>
              {(searchTerm || selectedField || selectedLevel) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedField('');
                    setSelectedLevel('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Aucun cours trouvé
            </h3>
            <p className="text-slate-500">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 group"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl transform group-hover:scale-110 transition-transform">
                        {getFileIcon(course.file_type)}
                      </div>
                      <div className={`px-3 py-1 ${getFileTypeColor(course.file_type)} text-xs font-bold rounded-full`}>
                        {course.file_type}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.course_fields?.map((cf) => (
                      <span
                        key={cf.id}
                        className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-sm"
                      >
                        {cf.field?.name}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="space-y-2 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center text-slate-700 text-sm">
                      <User className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="font-medium mr-1">Enseignant:</span>
                      <span className="truncate">{course.teacher?.name}</span>
                    </div>
                    <div className="flex items-center text-slate-700 text-sm">
                      <GraduationCap className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="font-medium mr-1">Niveau:</span>
                      <span className="text-blue-600 font-semibold">{course.level}</span>
                    </div>
                    <div className="flex items-center text-slate-700 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="font-medium mr-1">Ajouté le:</span>
                      <span>{new Date(course.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(course)}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Download className="w-5 h-5" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
