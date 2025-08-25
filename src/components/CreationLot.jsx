import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Package, 
  FileText, 
  Calendar, 
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  Users,
  Hash,
  Info,
  Save,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import lotService from '../services/lotService';
import './CreerSinistre.css'; 


const InputField = React.memo(({ label, value, onChange, error, required = false, type = 'text', placeholder = '', maxLength = null, disabled = false }) => (
  <div className="input-field">
    <label className={`input-label ${required ? 'required' : ''}`}>
      {label}
      {required && <span className="required-star">*</span>}
    </label>
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      className={`input-control ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
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

const CreationLot = ({ sidebarCollapsed = false }) => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    obligatoires: true,
    optionnels: false,
    infos: false
  });

  const [formData, setFormData] = useState({
    numeroPolice: '',
    typeLotId: '',
    nombreSinistresRecu: '',
    nombreSinistresDeclare: '',
    raisonSocialeClient: '' 
  });

  const [infosPolice, setInfosPolice] = useState(null); 
  const [validationErrors, setValidationErrors] = useState({});

  const handleBack = useCallback(() => {
    navigate('/lots');
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

  
  useEffect(() => {
    const fetchInfos = async () => {
      if (formData.numeroPolice.length === 10) {
        try {
          const data = await lotService.fetchInfosPolice(formData.numeroPolice);
          const infos = {
            raisonSocialeClient: data.refSouscripteur?.raisonSocial || '',
            codeApporteur: data.refIntermediaireAppCode || '',
            raisonApporteur: data.refIntermediaireApp?.libelleLong || '',
            etatPolice: data.lastEtatContrat?.refEtatContrat?.libelle || '',
            dateEtat: data.lastEtatContrat?.dateEtat || ''
          };
          setInfosPolice(infos);

         
          setFormData(prev => ({
            ...prev,
            raisonSocialeClient: infos.raisonSocialeClient
          }));

          setExpandedSections(prev => ({
            ...prev,
            infos: true
          }));
        } catch (err) {
          console.error('Erreur lors de la récupération des infos police:', err);
          setInfosPolice(null);
        }
      } else {
        setInfosPolice(null);
        setExpandedSections(prev => ({
          ...prev,
          infos: false
        }));
      }
    };

    fetchInfos();
  }, [formData.numeroPolice]);

  const validateForm = () => {
    const errors = {};
    
   
    if (!formData.numeroPolice.trim()) {
      errors.numeroPolice = 'Le numéro de police est obligatoire';
    } else if (formData.numeroPolice.length !== 10) {
      errors.numeroPolice = 'Le numéro de police doit contenir exactement 10 caractères';
    }
    
    
    if (!formData.typeLotId.trim()) {
      errors.typeLotId = 'Le type de lot est obligatoire';
    }
    
   
    if (!formData.nombreSinistresRecu || formData.nombreSinistresRecu === '') {
      errors.nombreSinistresRecu = 'Le nombre de sinistres reçus est obligatoire';
    } else {
      const nombre = parseInt(formData.nombreSinistresRecu);
      if (isNaN(nombre) || nombre < 0) {
        errors.nombreSinistresRecu = 'Le nombre doit être un entier positif';
      }
    }
    
    
    if (formData.typeLotId === '2') {
      if (!formData.nombreSinistresDeclare || formData.nombreSinistresDeclare === '') {
        errors.nombreSinistresDeclare = 'Le nombre de sinistres déclarés est obligatoire pour les lots externes';
      } else {
        const nombre = parseInt(formData.nombreSinistresDeclare);
        if (isNaN(nombre) || nombre < 0) {
          errors.nombreSinistresDeclare = 'Le nombre doit être un entier positif';
        }
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
      setSuccessMessage('');
      
      console.log('🚀 Création du lot avec:', formData);
      
      const payload = {
        ...formData,
        nombreSinistresRecu: parseInt(formData.nombreSinistresRecu),
        nombreSinistresDeclare: formData.nombreSinistresDeclare
          ? parseInt(formData.nombreSinistresDeclare)
          : null
      };

      console.log('📤 Données envoyées au backend:', payload);
      
      const response = await lotService.createLotInterne(payload);
      
      console.log('✅ Lot créé:', response);
      
      setSuccessMessage(`Lot créé avec succès ! Numéro: ${response.data.numeroLot}`);
      
      setTimeout(() => {
        if (response.data?.id) {
          navigate(`/lots/details/${response.data.id}`);
        } else {
          navigate('/lots');
        }
      }, 2000);
      
    } catch (err) {
      console.error('❌ Erreur lors de la création:', err);
      setError(lotService.handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      numeroPolice: '',
      typeLotId: '',
      nombreSinistresRecu: '',
      nombreSinistresDeclare: '',
      raisonSocialeClient: ''
    });
    setValidationErrors({});
    setError('');
    setSuccessMessage('');
    setInfosPolice(null);
  }, []);

  return (
    <div className={`create-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <nav className="breadcrumb">
        <span onClick={handleBack} className="breadcrumb-link">Accueil</span>
        <span className="separator">›</span>
        <span onClick={handleBack} className="breadcrumb-link">Lots</span>
        <span className="separator">›</span>
        <span className="current">Créer Lot</span>
      </nav>

      <div className="create-header">
        <div className="header-main">
          <h1 className="page-title">
            <Package className="title-icon" />
            Création d'un Lot Sinistre
          </h1>
          <div className="status-container">
            <FileText className="status-icon" />
            <span className="status-badge status-new">Nouveau</span>
          </div>
        </div>
        
        <div className="header-summary">
          <div className="summary-item">
            <span className="summary-label">Type</span>
            <span className="summary-value">Lot de sinistres</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Statut</span>
            <span className="summary-value">En cours de création</span>
          </div>
          {infosPolice && (
            <div className="summary-item">
              <span className="summary-label">Client</span>
              <span className="summary-value">{infosPolice.raisonSocialeClient}</span>
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
            Retour aux lots
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle className="alert-icon" />
          <div className="alert-content">
            <strong>Erreur :</strong> {error}
            {error.includes('police non trouvée') && (
              <div className="alert-help">
                💡 <strong>Aide :</strong> Vérifiez que le numéro de police existe et contient exactement 10 caractères.
              </div>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle className="alert-icon" />
          <span>{successMessage}</span>
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
                value={formData.numeroPolice}
                onChange={(e) => handleInputChange('numeroPolice', e.target.value)}
                error={validationErrors.numeroPolice}
                required
                placeholder="Ex: 1234567890 (10 caractères)"
                maxLength={10}
              />
              
              <SelectField
                label="Type de Lot"
                value={formData.typeLotId}
                onChange={(e) => handleInputChange('typeLotId', e.target.value)}
                error={validationErrors.typeLotId}
                required
                options={[
                  { value: '1', label: 'Interne' },
                  { value: '2', label: 'Externe' }
                ]}
              />
              
              <InputField
                label="Nombre de Sinistres Reçus"
                value={formData.nombreSinistresRecu}
                onChange={(e) => handleInputChange('nombreSinistresRecu', e.target.value)}
                error={validationErrors.nombreSinistresRecu}
                required
                type="number"
                placeholder="0"
              />
              
              {formData.typeLotId === '2' && (
                <InputField
                  label="Nombre de Sinistres Déclarés"
                  value={formData.nombreSinistresDeclare}
                  onChange={(e) => handleInputChange('nombreSinistresDeclare', e.target.value)}
                  error={validationErrors.nombreSinistresDeclare}
                  required
                  type="number"
                  placeholder="0"
                />
              )}
            </div>
          </ExpandableCard>

          {infosPolice && (
            <ExpandableCard 
              title="Informations Police Récupérées" 
              icon={Info} 
              sectionKey="infos"
              badgeText="Auto-remplies"
              expandedSections={expandedSections}
              onToggle={toggleSection}
            >
              <div className="input-grid">
                <InputField
                  label="Client"
                  value={infosPolice.raisonSocialeClient}
                  onChange={() => {}}
                  disabled
                />
                
                <InputField
                  label="Code Apporteur"
                  value={infosPolice.codeApporteur}
                  onChange={() => {}}
                  disabled
                />
                
                <InputField
                  label="Raison Sociale Apporteur"
                  value={infosPolice.raisonApporteur}
                  onChange={() => {}}
                  disabled
                />
                
                <InputField
                  label="État de la Police"
                  value={infosPolice.etatPolice}
                  onChange={() => {}}
                  disabled
                />
                
                <InputField
                  label="Date État Police"
                  value={infosPolice.dateEtat}
                  onChange={() => {}}
                  disabled
                />
              </div>
              
              <div className="form-help-message">
                <Info className="help-icon" />
                Ces informations ont été récupérées automatiquement à partir du numéro de police.
              </div>
            </ExpandableCard>
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
                Créer le Lot
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreationLot;