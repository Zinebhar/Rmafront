import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Calendar, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Save,
  RefreshCw,
  Stethoscope,
  Building,
  Hash,
  Info,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import SinistreService from '../services/sinistreService';
import './ModifierSinistre.css';

const ModifierSinistre = ({ sidebarCollapsed = false }) => {
  const { numSinistre } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sinistreOriginal, setSinistreOriginal] = useState(null);
  const [typesDeclaration, setTypesDeclaration] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  
  const [formData, setFormData] = useState({
    codeDecl: '',
    dateSurv: '',
    dateDecl: '',
    montoFe: '',
    refExtSi: '',
    natuMala: '',
    numSinistre: '',
    numPolice: '',
    numAffiliation: '',
    nomCompletAssure: '',
    etatSinistreLibelle: ''
  });

  const [validation, setValidation] = useState({});

  // Chargement des types de déclaration
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
    const loadSinistreDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Chargement du sinistre pour modification:', numSinistre);
        
        const response = await SinistreService.getDetailsSinistre(numSinistre);
        const sinistre = response.data;
        
        console.log('📄 Sinistre chargé:', sinistre);
        setSinistreOriginal(sinistre);
        
        setFormData({
          codeDecl: sinistre.codeDecl || '',
          dateSurv: sinistre.dateSurv || '',
          dateDecl: sinistre.dateDecl || '',
          montoFe: sinistre.montoFe || '',
          refExtSi: sinistre.refExtSi || '',
          natuMala: sinistre.natuMala || '',
          numSinistre: sinistre.numSinistre || '',
          numPolice: sinistre.numPolice || '',
          numAffiliation: sinistre.numAffiliation || '',
          nomCompletAssure: sinistre.nomCompletAssure || '',
          etatSinistreLibelle: sinistre.etatSinistreLibelle || ''
        });
        
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setError(SinistreService.handleAPIError(error));
      } finally {
        setLoading(false);
      }
    };

    if (numSinistre) {
      loadSinistreDetails();
    }
  }, [numSinistre]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (validation[field]) {
      setValidation(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    setError('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    const errors = {};
    
    // Validation du code de déclaration
    if (!formData.codeDecl || !formData.codeDecl.trim()) {
      errors.codeDecl = 'Le type de déclaration est obligatoire';
    }
    
    // Validation de la date de survenance
    if (!formData.dateSurv || !formData.dateSurv.trim()) {
      errors.dateSurv = 'La date de survenance est obligatoire';
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (formData.dateSurv && !dateRegex.test(formData.dateSurv)) {
      errors.dateSurv = 'Format de date invalide (AAAA-MM-JJ)';
    }
    
    if (formData.dateSurv) {
      const dateSurv = new Date(formData.dateSurv);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (dateSurv > today) {
        errors.dateSurv = 'La date de survenance ne peut pas être dans le futur';
      }
    }
    
    // Validation de la date de déclaration
    if (formData.dateDecl && formData.dateDecl.trim() && !dateRegex.test(formData.dateDecl)) {
      errors.dateDecl = 'Format de date invalide (AAAA-MM-JJ)';
    }
    
    if (formData.dateSurv && formData.dateDecl) {
      const dateSurv = new Date(formData.dateSurv);
      const dateDecl = new Date(formData.dateDecl);
      
      if (dateDecl < dateSurv) {
        errors.dateDecl = 'La date de déclaration ne peut pas être antérieure à la date de survenance';
      }
    }
    
    // Validation du montant
    if (formData.montoFe && formData.montoFe.trim()) {
      const montant = parseFloat(formData.montoFe);
      if (isNaN(montant) || montant < 0) {
        errors.montoFe = 'Le montant doit être un nombre positif';
      }
    }
    
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('💾 Modification du sinistre:', numSinistre, formData);
      
      const modificationData = {
        codeDecl: formData.codeDecl.trim(),
        dateSurv: formData.dateSurv.trim(),
        dateDecl: formData.dateDecl && formData.dateDecl.trim() ? formData.dateDecl.trim() : null,
        montoFe: formData.montoFe && formData.montoFe.trim() ? formData.montoFe.trim() : null,
        refExtSi: formData.refExtSi && formData.refExtSi.trim() ? formData.refExtSi.trim() : null,
        natuMala: formData.natuMala && formData.natuMala.trim() ? formData.natuMala.trim() : null
      };
      
      console.log('📤 Données à envoyer:', modificationData);
      
      const response = await SinistreService.modifierSinistre(numSinistre, modificationData);
      
      console.log('✅ Réponse de modification:', response);
      
      setSuccessMessage(response.message || 'Sinistre modifié avec succès !');
      
      if (response.data) {
        setSinistreOriginal(response.data);
        
        setFormData(prev => ({
          ...prev,
          ...response.data
        }));
      }
      
      setTimeout(() => {
        navigate(`/consultation/sinistres/${numSinistre}/details`);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erreur lors de la modification:', error);
      const errorMessage = SinistreService.handleAPIError(error);
      setError(errorMessage);
      
      // Si erreur liée aux états non modifiables, rediriger vers les détails
      if (errorMessage.includes('ne peut pas être modifié') || 
          errorMessage.includes('réouverture est possible') ||
          errorMessage.includes('consultation uniquement')) {
        setTimeout(() => {
          navigate(`/consultation/sinistres/${numSinistre}/details`);
        }, 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/consultation/sinistres/${numSinistre}/details`);
  };

  const handleViewDetails = () => {
    navigate(`/consultation/sinistres/${numSinistre}/details`);
  };

  const hasChanges = () => {
    if (!sinistreOriginal) return false;
    
    return (
      formData.codeDecl !== (sinistreOriginal.codeDecl || '') ||
      formData.dateSurv !== (sinistreOriginal.dateSurv || '') ||
      formData.dateDecl !== (sinistreOriginal.dateDecl || '') ||
      formData.montoFe !== (sinistreOriginal.montoFe || '') ||
      formData.refExtSi !== (sinistreOriginal.refExtSi || '') ||
      formData.natuMala !== (sinistreOriginal.natuMala || '')
    );
  };

  const getStatusIcon = (etat) => {
    switch (etat?.toLowerCase()) {
      case 'ouvert':
      case 'en cours':
        return <Clock className="status-icon" />;
      case 'clôturé':
      case 'cloture':
      case 'reglé':
      case 'réglé':
        return <CheckCircle className="status-icon" />;
      case 'rejeté':
      case 'rejete':
      case 'annulé':
      case 'annule':
        return <AlertCircle className="status-icon" />;
      default:
        return <FileText className="status-icon" />;
    }
  };

  const formatMontant = (montant) => {
    if (!montant) return '';
    const num = parseFloat(montant);
    return isNaN(num) ? montant : num.toFixed(2);
  };

  if (loading) {
    return (
      <div className={`modifier-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="loading-state">
          <RefreshCw className="loading-spinner" />
          <div className="loading-content">
            <h3>Chargement du sinistre...</h3>
            <p>Veuillez patienter pendant que nous récupérons les informations.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !sinistreOriginal) {
    return (
      <div className={`modifier-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="page-header">
          <button onClick={() => navigate('/consultation/sinistres')} className="btn btn-secondary">
            <ArrowLeft className="btn-icon" />
            Retour
          </button>
        </div>
        
        <div className="error-state">
          <div className="error-icon">
            <AlertCircle />
          </div>
          <div className="error-content">
            <h3>Erreur lors du chargement</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`modifier-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <nav className="breadcrumb">
        <span onClick={() => navigate('/consultation/sinistres')} className="breadcrumb-link">Accueil</span>
        <span className="separator">›</span>
        <span onClick={() => navigate('/consultation/sinistres')} className="breadcrumb-link">Consulter</span>
        <span className="separator">›</span>
        <span onClick={handleViewDetails} className="breadcrumb-link">Détails</span>
        <span className="separator">›</span>
        <span className="current">Modifier</span>
      </nav>

      <div className="modifier-header">
        <div className="header-main">
          <h1 className="page-title">
            <User className="title-icon" />
            Modifier Sinistre
          </h1>
          <div className="status-container">
            {getStatusIcon(formData.etatSinistreLibelle)}
            <span className={`status-badge ${
              formData.etatSinistreLibelle === 'OUVERT' 
                ? 'status-open' 
                : formData.etatSinistreLibelle === 'CLÔTURÉ' || formData.etatSinistreLibelle === 'CLOTURE'
                ? 'status-closed'
                : formData.etatSinistreLibelle === 'EN COURS'
                ? 'status-progress'
                : 'status-default'
            }`}>
              {formData.etatSinistreLibelle || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="header-summary">
          <div className="summary-item">
            <span className="summary-label">N° Sinistre</span>
            <span className="summary-value">{formData.numSinistre}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Assuré</span>
            <span className="summary-value">{formData.nomCompletAssure}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Police</span>
            <span className="summary-value">{formData.numPolice}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle className="alert-icon" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle className="alert-icon" />
          {successMessage}
        </div>
      )}

      {hasChanges() && !saving && !successMessage && (
        <div className="alert alert-warning">
          <Info className="alert-icon" />
          Des modifications non sauvegardées sont en cours. N'oubliez pas de sauvegarder.
        </div>
      )}

      <form onSubmit={handleSubmit} className="modifier-form">
        <div className="form-grid">
          
          <div className="form-section">
            <div className="section-header">
              <FileText className="section-icon" />
              <h3>Informations Générales</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">
                  Type Déclaration *
                </label>
                <select
                  value={formData.codeDecl}
                  onChange={(e) => handleInputChange('codeDecl', e.target.value)}
                  className={`form-input ${validation.codeDecl ? 'error' : ''}`}
                  disabled={loadingTypes}
                >
                  <option value="">-- Sélectionner --</option>
                  {typesDeclaration.map(type => (
                    <option key={type.code} value={type.code}>
                      {type.code} - {type.libelle}
                    </option>
                  ))}
                </select>
                {validation.codeDecl && (
                  <span className="error-message">{validation.codeDecl}</span>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label required">Date Survenance *</label>
                <input
                  type="date"
                  value={formData.dateSurv}
                  onChange={(e) => handleInputChange('dateSurv', e.target.value)}
                  className={`form-input ${validation.dateSurv ? 'error' : ''}`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {validation.dateSurv && (
                  <span className="error-message">{validation.dateSurv}</span>
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date Déclaration</label>
                <input
                  type="date"
                  value={formData.dateDecl}
                  onChange={(e) => handleInputChange('dateDecl', e.target.value)}
                  className={`form-input ${validation.dateDecl ? 'error' : ''}`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {validation.dateDecl && (
                  <span className="error-message">{validation.dateDecl}</span>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Référence Externe</label>
                <input
                  type="text"
                  value={formData.refExtSi}
                  onChange={(e) => handleInputChange('refExtSi', e.target.value)}
                  className="form-input"
                  placeholder="Référence externe du sinistre"
                  maxLength="50"
                />
                {validation.refExtSi && (
                  <span className="error-message">{validation.refExtSi}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <Stethoscope className="section-icon" />
              <h3>Informations Médicales</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">
                  Nature de la Maladie
                </label>
                <textarea
                  value={formData.natuMala}
                  onChange={(e) => handleInputChange('natuMala', e.target.value)}
                  className="form-textarea"
                  placeholder="Décrivez la nature de la maladie ou du traitement..."
                  rows="3"
                  maxLength="500"
                />
                {validation.natuMala && (
                  <span className="error-message">{validation.natuMala}</span>
                )}
                <div className="char-counter">
                  {formData.natuMala ? formData.natuMala.length : 0}/500
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <DollarSign className="section-icon" />
              <h3>Informations Financières</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Montant Frais Engagés (DH)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.montoFe}
                  onChange={(e) => handleInputChange('montoFe', e.target.value)}
                  className={`form-input ${validation.montoFe ? 'error' : ''}`}
                  placeholder="0.00"
                />
                {validation.montoFe && (
                  <span className="error-message">{validation.montoFe}</span>
                )}
                {formData.montoFe && !validation.montoFe && (
                  <span className="help-text">
                    Montant: {formatMontant(formData.montoFe)} DH
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section readonly">
            <div className="section-header">
              <Info className="section-icon" />
              <h3>Informations Consultation</h3>
            </div>
            
            <div className="readonly-grid">
              <div className="readonly-item">
                <label>N° Police</label>
                <span>{formData.numPolice || 'N/A'}</span>
              </div>
              <div className="readonly-item">
                <label>N° Affiliation</label>
                <span>{formData.numAffiliation || 'N/A'}</span>
              </div>
              <div className="readonly-item">
                <label>Nom Complet Assuré</label>
                <span>{formData.nomCompletAssure || 'N/A'}</span>
              </div>
              <div className="readonly-item">
                <label>État Sinistre</label>
                <span>{formData.etatSinistreLibelle || 'N/A'}</span>
              </div>
              <div className="readonly-item">
                <label>Type Déclaration</label>
                <span>
                  {formData.codeDecl ? 
                    `${formData.codeDecl} - ${typesDeclaration.find(t => t.code === formData.codeDecl)?.libelle || formData.codeDecl}` 
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleViewDetails}
            className="btn btn-outline"
          >
            <Eye className="btn-icon" />
            Voir Détails
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
          >
            <ArrowLeft className="btn-icon" />
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={saving || !hasChanges()}
            className="btn btn-primary"
            title={!hasChanges() ? 'Aucune modification à sauvegarder' : ''}
          >
            {saving ? (
              <RefreshCw className="btn-icon animate-spin" />
            ) : (
              <Save className="btn-icon" />
            )}
            {saving ? 'Modification...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifierSinistre;