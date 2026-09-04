import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Building,
  MapPin,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatters';
import { storageService } from '../../services/storage';
import { apiClient } from '../../services/api';

export const SettingsView: React.FC = () => {
  const {
    festivals,
    activeFestival,
    switchFestival,
    createFestival,
    updateFestival,
    deleteFestival,
    clearAllDemoData,
    showToast,
  } = useFinance();

  const { t, language, formatAmountInWords } = useLanguage();
  const { canEdit } = useAuth();

  const [isEditingActive, setIsEditingActive] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [festivalToDelete, setFestivalToDelete] = useState<{ id: string; name: string; year: number } | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Active festival form state
  const [name, setName] = useState(activeFestival?.name || t.mandalName);
  const [year, setYear] = useState(activeFestival?.year || 2026);
  const [startDate, setStartDate] = useState(activeFestival?.startDate || '');
  const [endDate, setEndDate] = useState(activeFestival?.endDate || '');
  const [location, setLocation] = useState(activeFestival?.location || t.locationDefault);
  const [organizer, setOrganizer] = useState(activeFestival?.organizer || t.organizerDefault);
  const [openingBalance, setOpeningBalance] = useState<number>(activeFestival?.openingBalance || activeFestival?.initialBalance || 0);
  const [regNumber, setRegNumber] = useState(activeFestival?.registrationNumber || '');

  // New festival state
  const [newName, setNewName] = useState('Shree Sai Mitra Mandal 2027');
  const [newYear, setNewYear] = useState(2027);
  const [newOrganizer, setNewOrganizer] = useState(activeFestival?.organizer || 'Shree Sai Mitra Mandal');
  const [newLocation, setNewLocation] = useState(activeFestival?.location || 'Shree Sai Colony, Karvenagar, Pune');
  const [newOpeningBalance, setNewOpeningBalance] = useState(0);

  // Sync state when active festival changes
  React.useEffect(() => {
    if (activeFestival) {
      setName(activeFestival.name);
      setYear(activeFestival.year);
      setStartDate(activeFestival.startDate || '');
      setEndDate(activeFestival.endDate || '');
      setLocation(activeFestival.location);
      setOrganizer(activeFestival.organizer);
      setOpeningBalance(activeFestival.initialBalance ?? activeFestival.openingBalance ?? 0);
      setRegNumber(activeFestival.registrationNumber || '');
    }
  }, [activeFestival]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      showToast('error', 'Forbidden (403)', 'Viewer accounts have read-only access.');
      return;
    }
    if (!activeFestival) return;
    updateFestival({
      ...activeFestival,
      name,
      year: Number(year),
      startDate,
      endDate,
      location,
      organizer,
      initialBalance: Number(openingBalance),
      openingBalance: Number(openingBalance),
      registrationNumber: regNumber,
    });
    setIsEditingActive(false);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      showToast('error', 'Forbidden (403)', 'Viewer accounts have read-only access.');
      return;
    }
    createFestival({
      name: newName,
      year: Number(newYear),
      startDate: `${newYear}-08-25`,
      endDate: `${newYear}-09-05`,
      location: newLocation,
      organizer: newOrganizer,
      initialBalance: Number(newOpeningBalance),
      openingBalance: Number(newOpeningBalance),
      registrationNumber: regNumber || 'MAH/PUN/2026/SSM-108',
      description: `Shree Sai Mitra Mandal - Year ${newYear - 1990} Ganeshotsav`,
    });
    setShowCreateModal(false);
  };

  const confirmDeleteFestival = async () => {
    if (!festivalToDelete) return;
    if (!canEdit) {
      showToast('error', 'Forbidden (403)', 'Viewer accounts have read-only access.');
      setFestivalToDelete(null);
      return;
    }

    await deleteFestival(festivalToDelete.id);
    setFestivalToDelete(null);
  };

  const handleClearDemoData = async () => {
    if (!canEdit) {
      showToast('error', 'Forbidden (403)', 'Viewer accounts have read-only access.');
      setShowClearConfirmModal(false);
      return;
    }
    // Take safety backup first
    await handleDownloadBackup();
    await clearAllDemoData();
    setShowClearConfirmModal(false);
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await apiClient.downloadBackup();
      if (res.success && res.data) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shree_sai_mandal_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('success', 'Backup Downloaded', 'Full database snapshot downloaded successfully.');
      } else {
        showToast('error', 'Backup Failed', res.error || 'Could not download backup.');
      }
    } catch (e: any) {
      showToast('error', 'Backup Error', e.message || 'Error creating backup file.');
    }
  };

  return (
    <div id="settings-view" className="space-y-6 font-['Mukta',sans-serif]">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">
              {t.settings} ({t.settingsSub})
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {language === 'mr'
              ? 'मंडळाचे नाव, उत्सव वर्ष व्यवस्थापन, बॅनर मीडिया लायब्ररी आणि सुरुवातीची शिल्लक रक्कम'
              : 'Configure mandal details, festival year archives, banner media library, and accounts'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Download Backup Button (Safety feature) */}
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer"
            title="Download full database backup (JSON)"
          >
            <Download className="w-3.5 h-3.5 text-slate-700" />
            <span>{language === 'mr' ? 'डेटाबेस बॅकअप' : 'Download Backup'}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'mr' ? '+ नवीन वर्ष / उत्सव जोडा' : '+ Add New Festival Year'}</span>
          </button>

          <button
            onClick={() => setShowClearConfirmModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
            title="Clear all demo/placeholder data to start fresh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'डमी डेटा साफ करा (Start Fresh)' : 'Clear Demo Data'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Year Festival Archive with DELETE Functionality */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              {language === 'mr' ? 'वर्षवार उत्सव नोंदी (Festival Year Archive)' : 'Festival Year Archive'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'mr'
                ? 'प्रत्येक वर्षाची स्वतंत्र हिशोब वही. आवश्यक असल्यास वर्ष हटवण्यासाठी पुढील डिलीट (Delete) बटण वापरा.'
                : 'Year-wise festival finance ledgers. Use the delete button to remove any year entry.'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {language === 'mr' ? 'एकूण उत्सव वर्ष:' : 'Total Festivals:'} {festivals.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {festivals.map(f => {
            const isActive = f.id === activeFestival?.id;
            return (
              <div
                key={f.id}
                className={`p-4 rounded-2xl border transition-all relative group ${
                  isActive
                    ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                {/* Top Row: Year badge & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200">
                      {language === 'mr' ? 'वर्ष:' : 'Year:'} {f.year}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 text-[10px] font-black bg-amber-600 text-white rounded-full">
                        {language === 'mr' ? 'सक्रिय' : 'Active'}
                      </span>
                    )}
                  </div>

                  {/* Delete Button for Festival Year */}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setFestivalToDelete({ id: f.id, name: f.name, year: f.year });
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={language === 'mr' ? 'हे उत्सव वर्ष हटवा (Delete Year)' : 'Delete Festival Year'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Festival Details */}
                <div
                  onClick={() => switchFestival(f.id)}
                  className="cursor-pointer mt-2"
                >
                  <h4 className="font-black text-slate-900 text-sm truncate">{f.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">{f.location}</p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex justify-between font-bold">
                    <span>{t.openingBalance}:</span>
                    <span className="text-slate-900 font-mono">
                      {formatINR(f.initialBalance ?? f.openingBalance ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Festival Details Editor */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">
              {language === 'mr' ? 'सक्रिय उत्सव माहिती बदल करा:' : 'Edit Active Festival Details:'} {activeFestival?.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'mr'
                ? 'मंडळाचे नाव, पत्ता आणि सुरुवातीची शिल्लक रक्कम दुरुस्त करा'
                : 'Modify mandal title, location, and starting treasury balance'}
            </p>
          </div>
          {canEdit && !isEditingActive && (
            <button
              onClick={() => setIsEditingActive(true)}
              className="px-3.5 py-1.5 text-xs font-black text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl cursor-pointer"
            >
              {language === 'mr' ? 'माहिती बदला (Edit)' : 'Edit Info'}
            </button>
          )}
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'mr' ? 'मंडळाचे नाव' : 'Mandal Name'}
              </label>
              <input
                type="text"
                disabled={!isEditingActive || !canEdit}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl disabled:bg-slate-100 disabled:text-slate-600 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'mr' ? 'उत्सव वर्ष' : 'Festival Year'}
              </label>
              <input
                type="number"
                disabled={!isEditingActive || !canEdit}
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl disabled:bg-slate-100 disabled:text-slate-600 font-bold font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'mr' ? 'आयोजक संस्था / मंडळ शीर्षक' : 'Organizer / Mandal Header'}
              </label>
              <input
                type="text"
                disabled={!isEditingActive || !canEdit}
                value={organizer}
                onChange={e => setOrganizer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl disabled:bg-slate-100 disabled:text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'mr' ? 'मंडप / उत्सव स्थळ' : 'Location / Venue'}
              </label>
              <input
                type="text"
                disabled={!isEditingActive || !canEdit}
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl disabled:bg-slate-100 disabled:text-slate-600 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">{t.openingBalance} (₹)</label>
              <input
                type="number"
                disabled={!isEditingActive || !canEdit}
                value={openingBalance}
                onChange={e => setOpeningBalance(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl disabled:bg-slate-100 disabled:text-slate-600 font-black text-amber-900 text-sm font-mono"
              />
              {typeof openingBalance === 'number' && openingBalance > 0 && (
                <p className="text-[11px] text-amber-800 font-bold mt-1">
                  {t.amountInWords}: {formatAmountInWords(openingBalance)}
                </p>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'mr' ? 'नोंदणी क्रमांक' : 'Registration Number'}
              </label>
              <input
                type="text"
                disabled={!isEditingActive || !canEdit}
                value={regNumber}
                onChange={e => setRegNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl disabled:bg-slate-100 disabled:text-slate-600 font-mono"
              />
            </div>
          </div>

          {isEditingActive && canEdit && (
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditingActive(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md cursor-pointer"
              >
                {t.save}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Delete Festival Year Confirmation Dialog */}
      {festivalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-['Mukta',sans-serif]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'mr' ? 'उत्सव वर्ष हटवा (Confirm Delete)?' : 'Confirm Festival Deletion'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {language === 'mr' ? 'ही क्रिया पूर्ववत करता येणार नाही.' : 'This action cannot be undone.'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/80 p-3 rounded-xl border border-rose-200">
              {language === 'mr'
                ? `तुम्हाला खात्री आहे का की तुम्ही वर्ष ${festivalToDelete.year} ("${festivalToDelete.name}") हटवू इच्छिता? या वर्षाच्या सर्व देणगी आणि खर्चाच्या नोंदी डेटाबेसमधून कायमस्वरूपी काढल्या जातील.`
                : `Are you sure you want to delete year ${festivalToDelete.year} ("${festivalToDelete.name}")? All donations, expenses, and budget entries for this year will be permanently removed.`}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFestivalToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={confirmDeleteFestival}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? 'होय, वर्ष हटवा' : 'Yes, Delete Festival Year'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Demo Data Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-['Mukta',sans-serif]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <RotateCcw className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'mr' ? 'डमी डेटा साफ करा (Clear Demo Data)?' : 'Clear All Demo Data?'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {language === 'mr' ? 'नवीन खऱ्या नोंदींसाठी सिस्टिम रिकामी करणे' : 'Prepare fresh and empty database'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/80 p-3 rounded-xl border border-amber-200">
              {language === 'mr'
                ? 'सर्व जुन्या डमी/नमुना नोंदी, जुने चाचणी उत्सव वर्ष आणि सॅम्पल डेटा डेटाबेसमधून साफ केला जाईल. फक्त ३६ वे उत्सव वर्ष (२०२६) व छत्रपती शिवाजी महाराज आणि साई बाबा बॅनर सुरू राहील.'
                : 'All sample/placeholder entries and old test records will be cleared. The system will start fresh and empty with the 36th festival year ready for real entry.'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleClearDemoData}
                className="px-4 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md cursor-pointer"
              >
                {language === 'mr' ? 'साफ करा (Clear & Start Fresh)' : 'Clear & Start Fresh'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Festival Modal */}
      {showCreateModal && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-['Mukta',sans-serif]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b pb-3">
              {language === 'mr' ? '+ नवीन वर्ष / उत्सव तयार करा' : '+ Add New Festival Year'}
            </h3>

            <form onSubmit={handleCreateNew} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'mr' ? 'उत्सव शीर्षक' : 'Festival Name'}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'mr' ? 'वर्ष' : 'Year'}
                </label>
                <input
                  type="number"
                  value={newYear}
                  onChange={e => setNewYear(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'mr' ? 'मंडळ / संस्था' : 'Organizer'}
                </label>
                <input
                  type="text"
                  value={newOrganizer}
                  onChange={e => setNewOrganizer(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'mr' ? 'स्थान / पत्ता' : 'Location'}
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{t.openingBalance} (₹)</label>
                <input
                  type="number"
                  value={newOpeningBalance}
                  onChange={e => setNewOpeningBalance(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  {language === 'mr' ? 'तयार करा व निवडा' : 'Create & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
