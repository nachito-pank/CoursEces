import { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, X, Key } from 'lucide-react';
import { supabase, Teacher, Field } from '../lib/supabase';
import { Link } from '../components/Link';

const ADMIN_KEY = 'a';

export function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [activeTab, setActiveTab] = useState<'teachers' | 'fields'>('teachers');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'teacher' | 'field'>('teacher');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('adminAuth');
    if (savedAuth === 'true') {
      setAuthenticated(true);
      loadData();
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_KEY) {
      setAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      loadData();
    } else {
      showMessage('error', 'Clé admin incorrecte');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: teachersData } = await supabase
        .from('teachers')
        .select('*')
        .order('name');

      const { data: fieldsData } = await supabase
        .from('fields')
        .select('*')
        .order('name');

      if (teachersData) setTeachers(teachersData);
      if (fieldsData) setFields(fieldsData);
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

  const handleOpenModal = (type: 'teacher' | 'field', item?: any) => {
    setModalType(type);
    setEditingItem(item || null);

    if (type === 'teacher' && item) {
      setFormData({
        name: item.name,
        email: item.email,
        phone: item.phone || '',
        password: '',
      });
    } else if (type === 'field' && item) {
      setFormData({
        name: item.name,
        email: '',
        phone: '',
        password: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
      });
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
    });
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalType === 'teacher') {
        const teacherData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
        };

        if (formData.password) {
          teacherData.password_hash = await hashPassword(formData.password);
        }

        if (editingItem) {
          const { error } = await supabase
            .from('teachers')
            .update(teacherData)
            .eq('id', editingItem.id);

          if (error) throw error;
          showMessage('success', 'Enseignant modifié avec succès');
        } else {
          if (!formData.password) {
            showMessage('error', 'Le mot de passe est requis');
            return;
          }

          const { error } = await supabase
            .from('teachers')
            .insert([teacherData]);

          if (error) throw error;
          showMessage('success', 'Enseignant ajouté avec succès');
        }
      } else {
        const fieldData = { name: formData.name };

        if (editingItem) {
          const { error } = await supabase
            .from('fields')
            .update(fieldData)
            .eq('id', editingItem.id);

          if (error) throw error;
          showMessage('success', 'Filière modifiée avec succès');
        } else {
          const { error } = await supabase
            .from('fields')
            .insert([fieldData]);

          if (error) throw error;
          showMessage('success', 'Filière ajoutée avec succès');
        }
      }

      handleCloseModal();
      loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (type: 'teacher' | 'field', id: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cet élément ?`)) return;

    try {
      const table = type === 'teacher' ? 'teachers' : 'fields';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      showMessage('success', `${type === 'teacher' ? 'Enseignant' : 'Filière'} supprimé(e) avec succès`);
      loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Erreur lors de la suppression');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Administration
              </h2>
              <p className="text-slate-600">
                Accès réservé aux administrateurs
              </p>
            </div>

            {message.text && message.type === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Clé d'administration
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    placeholder="Entrez la clé admin"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                Accéder
              </button>
              <div className="mt-6 text-center">
                <Link to="/" className="text-sm text-blue-600 hover:text-blue-700">
                  Retour à l'accueil
                </Link>
              </div> 
              
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-slate-700" />
            Administration
          </h1>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'teachers'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Enseignants
            </button>
            <button
              onClick={() => setActiveTab('fields')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'fields'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Filières
            </button>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {activeTab === 'teachers' ? 'Liste des enseignants' : 'Liste des filières'}
              </h2>
              <button
                onClick={() => handleOpenModal(activeTab === 'teachers' ? 'teacher' : 'field')}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
              </div>
            ) : activeTab === 'teachers' ? (
              <div className="space-y-4">
                {teachers.length === 0 ? (
                  <p className="text-center py-12 text-slate-500">
                    Aucun enseignant enregistré
                  </p>
                ) : (
                  teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold text-slate-900">{teacher.name}</h3>
                        <p className="text-sm text-slate-600">{teacher.email}</p>
                        {teacher.phone && (
                          <p className="text-sm text-slate-600">{teacher.phone}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal('teacher', teacher)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('teacher', teacher.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {fields.length === 0 ? (
                  <p className="text-center py-12 text-slate-500">
                    Aucune filière enregistrée
                  </p>
                ) : (
                  fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <h3 className="font-semibold text-slate-900">{field.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal('field', field)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('field', field.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingItem
                  ? `Modifier ${modalType === 'teacher' ? "l'enseignant" : 'la filière'}`
                  : `Ajouter ${modalType === 'teacher' ? 'un enseignant' : 'une filière'}`
                }
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
                  Nom {modalType === 'teacher' ? 'complet' : 'de la filière'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              {modalType === 'teacher' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Numéro de téléphone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mot de passe {!editingItem && '*'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      required={!editingItem}
                    />
                    {editingItem && (
                      <p className="text-sm text-slate-500 mt-2">
                        Laissez vide pour conserver le mot de passe actuel
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
