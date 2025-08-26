import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Calendar, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  Building,
  CreditCard,
  Stethoscope,
  Hash,
  Info,
  Save,
  RefreshCw,
  Upload,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SinistreService from '../services/sinistreService';
import './CreerSinistre.css';
import BeneficiaireService from '../services/beneficiaireService';
import { getAuthToken } from '../config/auth';

const formatDateToDDMMYYYY = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const InputField = React.memo(({ label, value, onChange, error, required = false, type = 'text', placeholder = '', maxLength = null }) => (
  <div className="input-field">
    <label className={`input-label ${required ? 'required' : ''}`}>
      {label}
      {required && <span className="required-star">*</span>}
    </label>
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      className={`input-control ${error ? 'error' : ''}`}
      placeholder={placeholder}
      maxLength={maxLength}
    />
    {error && <span className="error-message">{error}</span>}
  </div>
));

const SelectField = React.memo(({ label, value, onChange, options, error, required = false }) => (
  <div className="input-field">
    <label className={`input-label ${required ? 'required' : ''}`}>
      {label}
      {required && <span className="required-star">*</span>}
    </label>
    <select
      value={value || ''}
      onChange={onChange}
      className={`input-control ${error ? 'error' : ''}`}
    >
      <option value="">-- Sélectionner --</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <span className="error-message">{error}</span>}
  </div>
));

const TextAreaField = React.memo(({ label, value, onChange, error, placeholder = '', rows = 3 }) => (
  <div className="input-field full-width">
    <label className="input-label">{label}</label>
    <textarea
      value={value || ''}
      onChange={onChange}
      className={`input-control ${error ? 'error' : ''}`}
      placeholder={placeholder}
      rows={rows}
    />
    {error && <span className="error-message">{error}</span>}
  </div>
));

const ExpandableCard = React.memo(({ title, icon, children, sectionKey, expandedSections, onToggle, badgeText = null }) => {
  const IconElement = icon;
  
  return (
    <div className="form-card">
      <div 
        className="card-header clickable" 
        onClick={() => onToggle(sectionKey)}
      >
        <div className="card-title">
          <IconElement className="card-icon" />
          <span>{title}</span>
          {badgeText && (
            <span className="section-badge">{badgeText}</span>
          )}
        </div>
        <div className="expand-controls">
          {expandedSections[sectionKey] ? (
            <Minus className="expand-icon" />
          ) : (
            <Plus className="expand-icon" />
          )}
        </div>
      </div>
      
      {expandedSections[sectionKey] && (
        <div className="card-content">
          {children}
        </div>
      )}
    </div>
  );
});

const CreerSinistre = ({ sidebarCollapsed = false }) => {
  const navigate = useNavigate();
  const [fichier, setFichier] = useState(null);
  const [typesDeclaration, setTypesDeclaration] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    obligatoires: true,
    optionnels: false,
    avances: false
  });
  const [benefList, setBenefList] = useState([]);
  const [benefLoading, setBenefLoading] = useState(false);
  const [benefError, setBenefError] = useState('');
  const [ setShowNewBenef] = useState(false);
  const [formData, setFormData] = useState({
    numPolice: '',
    numAffiliation: '',
    codeDecl: '',
    dateSurv: '',
    dateDecl: '',
    montoFe: '',
    refExtSi: '',
    natuMala: '',
    numFiliale: '',
    numCompl: '',
    lieParbe: '',
    numOrdre: '',
    codeSpeMa: '',
    codeClin: '',
    codeMede: '',
    dateOuve: '',
    monAvaSi: '',
    dossTran: '',
    fausDecl: 'false',
    siniArch: 'false',
    obbseSini: '',
    beneficiaireId: '' 
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const loadTypesDeclaration = async () => {
      try {
        setLoadingTypes(true);
        const response = await SinistreService.getTypesDeclaration();
        setTypesDeclaration(response.data);
      } catch (error) {
        console.error('Erreur chargement types:', error);
      } finally {
        setLoadingTypes(false);
      }
    };

    loadTypesDeclaration();
  }, []);

  useEffect(() => {
    const police = formData.numPolice?.trim();
    const aff = formData.numAffiliation?.trim();

    setBenefError('');
    setBenefList([]);
    setFormData(prev => ({ ...prev, beneficiaireId: '' }));

    if (!police || !aff) return;

    let aborted = false;
    (async () => {
      try {
        setBenefLoading(true);
        const list = await BeneficiaireService.search({
          numeroContrat: police,
          numeroAffiliation: aff
        });

        if (aborted) return;

        const mapped = list.map(b => ({
          id: b.id ?? b.beneficiaireId ?? String(Math.random()),
          label: [b.nomBeneficiaire, b.prenomBeneficiaire]
            .filter(Boolean).join(' ') || 'Bénéficiaire',
          numOrdre: b.numOrdre || ''
        }));

        setBenefList(mapped);
      } catch (e) {
        if (!aborted) setBenefError('Impossible de charger les bénéficiaires.');
        console.error(e);
      } finally {
        if (!aborted) setBenefLoading(false);
      }
    })();

    return () => { aborted = true; };
  }, [formData.numPolice, formData.numAffiliation]);

  const handleBack = useCallback(() => {
    navigate('/consultation/sinistres');
  }, [navigate]);

  const toggleSection = useCallback((sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (value && value.trim()) {
      setValidationErrors(prev => {
        if (prev[field]) {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        }
        return prev;
      });
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.numPolice.trim()) {
      errors.numPolice = 'Le numéro de police est obligatoire';
    }
    if (!formData.numAffiliation.trim()) {
      errors.numAffiliation = 'Le numéro d\'affiliation est obligatoire';
    }
    if (!formData.codeDecl.trim()) {
      errors.codeDecl = 'Le type de déclaration est obligatoire';
    }
    if (!formData.dateSurv.trim()) {
      errors.dateSurv = 'La date de survenance est obligatoire';
    }

    if (formData.dateDecl && !formData.dateDecl.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.dateDecl = 'Format de date invalide (YYYY-MM-DD)';
    }
    if (formData.dateSurv && !formData.dateSurv.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.dateSurv = 'Format de date invalide (YYYY-MM-DD)';
    }
    if (formData.dateOuve && !formData.dateOuve.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.dateOuve = 'Format de date invalide (YYYY-MM-DD)';
    }

    if (!formData.montoFe.trim()) {
      errors.montoFe = 'Le montant des frais engagés est obligatoire';
    } else {
      const montant = parseFloat(formData.montoFe);
      if (isNaN(montant)) {
        errors.montoFe = 'Le montant doit être un nombre valide';
      } else if (montant < 0) {
        errors.montoFe = 'Le montant ne peut pas être négatif';
      } else if (montant > 1000000) {
        errors.montoFe = 'Le montant semble trop élevé (max 1,000,000)';
      }
    }

    if (formData.monAvaSi && formData.monAvaSi.trim()) {
      const montant = parseFloat(formData.monAvaSi);
      if (isNaN(montant)) {
        errors.monAvaSi = 'Le montant doit être un nombre valide';
      } else if (montant < 0) {
        errors.monAvaSi = 'Le montant ne peut pas être négatif';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const dataToSend = {
        ...formData,
        dateSurv: formatDateToDDMMYYYY(formData.dateSurv),
      };

      if (formData.dateDecl.trim()) {
        dataToSend.dateDecl = formatDateToDDMMYYYY(formData.dateDecl);
      }

      if (formData.dateOuve.trim()) {
        dataToSend.dateOuve = formatDateToDDMMYYYY(formData.dateOuve);
      }

      const formToSend = new FormData();
      formToSend.append(
        'sinistre',
        new Blob([JSON.stringify(dataToSend)], { type: 'application/json' })
      );
      
      if (fichier) {
        formToSend.append('fichier', fichier);
      }

      const response = await fetch(
        'http://localhost:8089/rest/api/v1/consultation/sinistres/creer-sans-lot',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: formToSend,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erreur HTTP ${response.status} : ${text}`);
      }

      const result = await response.json();
      const sinistre = result.data || (Array.isArray(result.data) ? result.data[0] : null);
      
      setSuccess(
        `Sinistre créé avec succès ! Numéro: ${sinistre?.numSinistre || 'N/A'}`
      );

      setTimeout(() => {
        if (sinistre?.numSinistre) {
          navigate(`/consultation/sinistres/${sinistre.numSinistre}/details`);
        } else {
          navigate('/consultation/sinistres');
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      setError(SinistreService.handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      numPolice: '',
      numAffiliation: '',
      codeDecl: '',
      dateSurv: '',
      dateDecl: '',
      montoFe: '',
      refExtSi: '',
      natuMala: '',
      numFiliale: '',
      numCompl: '',
      lieParbe: '',
      numOrdre: '',
      codeSpeMa: '',
      codeClin: '',
      codeMede: '',
      dateOuve: '',
      monAvaSi: '',
      dossTran: '',
      fausDecl: 'false',
      siniArch: 'false',
      obbseSini: '',
     beneficiaireId: ''
    });
    setBenefList([]);      
    setShowNewBenef(false);  
    setValidationErrors({});
    setError('');
    setSuccess('');
    setFichier(null);
  }, []);

  return (
    <div className={`create-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <nav className="breadcrumb">
        <span onClick={handleBack} className="breadcrumb-link">Accueil</span>
        <span className="separator">›</span>
        <span onClick={handleBack} className="breadcrumb-link">Consulter</span>
        <span className="separator">›</span>
        <span className="current">Créer Sinistre</span>
      </nav>

      <div className="create-header">
        <div className="header-main">
          <h1 className="page-title">Créer un Sinistre Sans Lot</h1>
          <div className="status-container">
            <FileText className="status-icon" />
            <span className="status-badge status-new">Nouveau</span>
          </div>
        </div>
        
        <div className="header-summary">
          <div className="summary-item">
            <span className="summary-label">Type</span>
            <span className="summary-value">Sinistre sans lot</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Statut</span>
            <span className="summary-value">En cours de création</span>
          </div>
          {formData.codeDecl && (
            <div className="summary-item">
              <span className="summary-label">Type déclaration</span>
              <span className="summary-value">
                {typesDeclaration.find(t => t.code === formData.codeDecl)?.libelle || formData.codeDecl}
              </span>
            </div>
          )}
        </div>

        <div className="header-actions">
          <button 
            type="button"
            onClick={resetForm} 
            className="btn btn-outline"
            disabled={loading}
          >
            <RefreshCw className="btn-icon" />
            Réinitialiser
          </button>
          
          <button onClick={handleBack} className="btn btn-secondary">
            <ArrowLeft className="btn-icon" />
            Retour à la consultation
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle className="alert-icon" />
          <div className="alert-content">
            <strong>Erreur :</strong> {error}
            {error.includes('Assuré non trouvé') && (
              <div className="alert-help">
                💡 <strong>Aide :</strong> Utilisez des données d'un assuré existant. 
                Consultez la page "Rechercher sinistre" pour obtenir des numéros de police et d'affiliation valides.
              </div>
            )}
            {error.includes('TYPE.DECLARATION.ERREUR') && (
              <div className="alert-help">
                💡 <strong>Aide :</strong> Essayez les codes: 24, 30, 38, CON, HOS, ou PHA
              </div>
            )}
            {error.includes('ASSURE.ETAT.ERREUR') && (
              <div className="alert-help">
                💡 <strong>État assuré invalide :</strong><br/>
                • L'assuré existe mais son état ne permet pas la création de sinistre<br/>
                • <strong>Solution :</strong> Utilisez un assuré d'un sinistre plus récent
              </div>
            )}
            {error.includes('FRAIS.ENGAGES.ERREUR') && (
              <div className="alert-help">
                💡 <strong>Aide :</strong> Problème avec le montant des frais. 
                Vérifiez le format (ex: 1500.50) et les limites autorisées.
              </div>
            )}
          </div>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle className="alert-icon" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-grid">
          
          <ExpandableCard 
            title="Informations Obligatoires" 
            icon={AlertCircle} 
            sectionKey="obligatoires"
            badgeText="Requis"
            expandedSections={expandedSections}
            onToggle={toggleSection}
          >
            <div className="input-grid">
              <InputField
                label="Numéro de Police"
                value={formData.numPolice}
                onChange={(e) => handleInputChange('numPolice', e.target.value)}
                error={validationErrors.numPolice}
                required
                placeholder="Ex: 123456789"
                maxLength={20}
              />
              
              <InputField
                label="Numéro d'Affiliation"
                value={formData.numAffiliation}
                onChange={(e) => handleInputChange('numAffiliation', e.target.value)}
                error={validationErrors.numAffiliation}
                required
                placeholder="Ex: 987654"
                maxLength={20}
              />
              
              <div className="input-field">
                <label className="input-label required">
                  Type de Déclaration
                  <span className="required-star">*</span>
                </label>
                <select
                  value={formData.codeDecl}
                  onChange={(e) => handleInputChange('codeDecl', e.target.value)}
                  className={`input-control ${validationErrors.codeDecl ? 'error' : ''}`}
                  disabled={loadingTypes}
                >
                  <option value="">
                    {loadingTypes ? '-- Chargement des types...' : '-- Sélectionner --'}
                  </option>
                  {typesDeclaration.map(type => (
                    <option key={type.code} value={type.code}>
                      {type.code} - {type.libelle}
                    </option>
                  ))}
                </select>
                {validationErrors.codeDecl && (
                  <span className="error-message">{validationErrors.codeDecl}</span>
                )}
              </div>
              
              <InputField
                label="Date de Survenance"
                value={formData.dateSurv}
                onChange={(e) => handleInputChange('dateSurv', e.target.value)}
                error={validationErrors.dateSurv}
                required
                type="date"
              />
              
              <InputField
                label="Montant Frais Engagés (DH)"
                value={formData.montoFe}
                onChange={(e) => handleInputChange('montoFe', e.target.value)}
                error={validationErrors.montoFe}
                required
                type="number"
                placeholder="Ex: 1500.50"
              />
            </div>
          </ExpandableCard>

          <ExpandableCard 
            title="Informations Optionnelles" 
            icon={Info} 
            sectionKey="optionnels"
            badgeText="Recommandées"
            expandedSections={expandedSections}
            onToggle={toggleSection}
          >
            <div className="optionnels-row">
              <div className="input-field beneficiaire ">
                <label className="input-label">
                  Choisir bénéficiaire
                  <span className="hint muted"> (chargé à partir du N° Police & N° Affiliation)</span>
                </label>
                <div className={`benef-select ${benefLoading ? 'loading' : ''}`}>
                  <select
                    value={formData.beneficiaireId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__NEW__') {
                        navigate('/beneficiaires/creer', {
                          state: {
                            numeroContrat: formData.numPolice?.trim() || '',
                            numeroAffiliation: formData.numAffiliation?.trim() || ''
                          }
                        });
                        return;
                      }
                      const found = benefList.find(b => String(b.id) === String(val));
                      handleInputChange('beneficiaireId', val);
                      if (found?.numOrdre) {
                        handleInputChange('numOrdre', found.numOrdre);
                      }
                    }}
                    className="input-control"
                    disabled={!formData.numPolice?.trim() || !formData.numAffiliation?.trim() || benefLoading}
                  >
                    <option value="">
                      {benefLoading
                        ? 'Chargement des bénéficiaires...'
                        : (!formData.numPolice?.trim() || !formData.numAffiliation?.trim())
                          ? 'Saisir N° Police et N° Affiliation'
                          : (benefList.length ? '-- Sélectionner --' : 'Aucun bénéficiaire trouvé')}
                    </option>

                    {(formData.numPolice?.trim() && formData.numAffiliation?.trim()) && (
                      <option value="__NEW__">Nouveau bénéficiaire ➕</option>
                    )}

                    {benefList.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>

                  {benefError && <span className="error-message">{benefError}</span>}
                </div>
              </div>

              <InputField
                label="Date de Déclaration"
                value={formData.dateDecl}
                onChange={(e) => handleInputChange('dateDecl', e.target.value)}
                error={validationErrors.dateDecl}
                type="date"
                placeholder="Auto si vide"
              />

              <InputField
                label="Référence Externe"
                value={formData.refExtSi}
                onChange={(e) => handleInputChange('refExtSi', e.target.value)}
                error={validationErrors.refExtSi}
                placeholder="Référence du sinistre"
                maxLength={50}
              />

              <InputField
                label="Nature de la Maladie"
                value={formData.natuMala}
                onChange={(e) => handleInputChange('natuMala', e.target.value)}
                error={validationErrors.natuMala}
                placeholder="Description de la pathologie"
                maxLength={200}
              />
            </div>
          </ExpandableCard>

          <ExpandableCard 
            title="Informations Avancées" 
            icon={Building} 
            sectionKey="avances"
            badgeText="Optionnel"
            expandedSections={expandedSections}
            onToggle={toggleSection}
          >
            <div className="input-grid">
              <InputField
                label="Numéro Filiale"
                value={formData.numFiliale}
                onChange={(e) => handleInputChange('numFiliale', e.target.value)}
                placeholder="Code filiale"
                maxLength={10}
              />
              
              <InputField
                label="Numéro complement"
                value={formData.numCompl}
                onChange={(e) => handleInputChange('numCompl', e.target.value)}
                placeholder="complement"
                maxLength={10}
              />
              
              <InputField
                label="Lieu (Parbe)"
                value={formData.lieParbe}
                onChange={(e) => handleInputChange('lieParbe', e.target.value)}
                placeholder="Lieu du sinistre"
                maxLength={50}
              />
              
              <InputField
                label="Numéro d'Ordre"
                value={formData.numOrdre}
                onChange={(e) => handleInputChange('numOrdre', e.target.value)}
                placeholder="Numéro d'ordre"
                maxLength={10}
              />
              
              <InputField
                label="Code Spécialité Maladie"
                value={formData.codeSpeMa}
                onChange={(e) => handleInputChange('codeSpeMa', e.target.value)}
                placeholder="Code spécialité"
                maxLength={10}
              />
              
              <InputField
                label="Code Clinique"
                value={formData.codeClin}
                onChange={(e) => handleInputChange('codeClin', e.target.value)}
                placeholder="Code établissement"
                maxLength={10}
              />
              
              <InputField
                label="Code Médecin"
                value={formData.codeMede}
                onChange={(e) => handleInputChange('codeMede', e.target.value)}
                placeholder="Code praticien"
                maxLength={10}
              />
              
              <InputField
                label="Date d'Ouverture"
                value={formData.dateOuve}
                onChange={(e) => handleInputChange('dateOuve', e.target.value)}
                error={validationErrors.dateOuve}
                type="date"
              />
              
              <InputField
                label="Montant Avance Sinistre (DH)"
                value={formData.monAvaSi}
                onChange={(e) => handleInputChange('monAvaSi', e.target.value)}
                error={validationErrors.monAvaSi}
                type="number"
                placeholder="Montant d'avance"
              />
              
              <InputField
                label="Dossier Transfert"
                value={formData.dossTran}
                onChange={(e) => handleInputChange('dossTran', e.target.value)}
                placeholder="Référence transfert"
                maxLength={50}
              />
              
              <SelectField
                label="Fausse Déclaration"
                value={formData.fausDecl}
                onChange={(e) => handleInputChange('fausDecl', e.target.value)}
                options={[
                  { value: 'false', label: 'Non' },
                  { value: 'true', label: 'Oui' }
                ]}
              />
              
              <SelectField
                label="Sinistre Archivé"
                value={formData.siniArch}
                onChange={(e) => handleInputChange('siniArch', e.target.value)}
                options={[
                  { value: 'false', label: 'Non' },
                  { value: 'true', label: 'Oui' }
                ]}
              />
            </div>
            
            <TextAreaField
              label="Observations"
              value={formData.obbseSini}
              onChange={(e) => handleInputChange('obbseSini', e.target.value)}
              placeholder="Commentaires ou observations sur le sinistre..."
              rows={4}
            />
          </ExpandableCard>
        </div>

        <div className="file-upload-section">
          <div className="file-upload-header">
            <FileText className="file-upload-icon" />
            <label className="input-label">
              Importer un fichier PDF (facultatif)
            </label>
            <span className="file-upload-badge">Facultatif</span>
          </div>

          <div className={`file-upload-container ${fichier ? 'has-file' : ''}`}>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFichier(e.target.files[0])}
              className="file-upload-input"
            />
            
            <div className="file-upload-content">
              <div className="file-upload-visual">
                {fichier ? (
                  <CheckCircle className="file-upload-visual-icon" />
                ) : (
                  <Upload className="file-upload-visual-icon" />
                )}
              </div>
              
              <div className="file-upload-text">
                {fichier ? (
                  <>
                    <div className="file-upload-main-text">Fichier sélectionné</div>
                    <div className="file-upload-sub-text">Cliquez pour changer de fichier</div>
                  </>
                ) : (
                  <>
                    <div className="file-upload-main-text">Glissez-déposez votre fichier PDF ici</div>
                    <div className="file-upload-sub-text">ou cliquez pour parcourir</div>
                    <div className="file-upload-specs">Format accepté : PDF • Taille max : 5 MB</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {fichier && (
            <div className="file-selected-info">
              <FileText className="file-selected-icon" />
              <div className="file-selected-details">
                <div className="file-selected-name">{fichier.name}</div>
                <div className="file-selected-size">{(fichier.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button 
                type="button"
                onClick={() => setFichier(null)}
                className="file-remove-btn"
                title="Supprimer le fichier"
              >
                <X className="file-remove-icon" />
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? (
              <>
                <Clock className="btn-icon spinning" />
                Création en cours...
              </>
            ) : (
              <>
                <Save className="btn-icon" />
                Créer le Sinistre
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreerSinistre;