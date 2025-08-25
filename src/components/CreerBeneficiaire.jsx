import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import beneficiaireService from '../services/beneficiaireService';
import './CreerBeneficiaire.css';
import { Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const required = (v) => (v?.toString().trim().length ? null : 'Champ obligatoire');

export default function CreerBeneficiaire() {
  const navigate = useNavigate();
  const location = useLocation();
  // si on vient de CreerSinistre, on récupère num police/affiliation
  const preset = useMemo(() => location.state || {}, [location.state]);

  const [formData, setFormData] = useState({
    numeroContrat: preset.numeroContrat || '',
    numeroAffiliation: preset.numeroAffiliation || '',
    nomBeneficiaire: '',
    prenomBeneficiaire: '',
    dateNaissance: '',
    sexeCode: '',
    typeBeneficiaireCode: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    if (errors[name]) setErrors((s) => ({ ...s, [name]: null }));
  };

  const validate = () => {
    const e = {};
    e.numeroContrat = required(formData.numeroContrat);
    e.numeroAffiliation = required(formData.numeroAffiliation);
    e.nomBeneficiaire = required(formData.nomBeneficiaire);
    e.prenomBeneficiaire = required(formData.prenomBeneficiaire);
    e.dateNaissance = required(formData.dateNaissance);
    e.sexeCode = required(formData.sexeCode);
    e.typeBeneficiaireCode = required(formData.typeBeneficiaireCode);
    Object.keys(e).forEach((k) => e[k] === null && delete e[k]);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    if (!validate()) return;

    try {
      setLoading(true);
      const resp = await beneficiaireService.add(formData);
      // le backend renvoie souvent {success, data, message}
      const dto = resp?.data || resp;

      setSuccess(
        `Bénéficiaire ajouté : ${dto?.nomBeneficiaire || formData.nomBeneficiaire} ${dto?.prenomBeneficiaire || formData.prenomBeneficiaire}`
      );

      // 🔁 revenir à la création sinistre en pré-remplissant & forcer le refresh des bénéficiaires
      navigate('/consultation/sinistres/creer', {
        replace: true,
        state: {
          numeroContrat: formData.numeroContrat,
          numeroAffiliation: formData.numeroAffiliation,
          createdBeneficiaire: dto,
        },
      });
    } catch (err) {
      setApiError(err?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="creer-benef-container">
      <div className="cb-header">
        <h1>Créer un Bénéficiaire</h1>
        <div className="cb-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            <ArrowLeft className="icon" />
            Retour
          </button>
        </div>
      </div>

      {apiError && (
        <div className="cb-alert cb-alert-error">
          <AlertCircle className="icon" />
          <span>{apiError}</span>
        </div>
      )}
      {success && (
        <div className="cb-alert cb-alert-success">
          <CheckCircle className="icon" />
          <span>{success}</span>
        </div>
      )}

      <form className="cb-form" onSubmit={submit} noValidate>
        <div className="cb-grid">
          <div className="cb-field">
            <label className="cb-label">N° Contrat *</label>
            <input
              name="numeroContrat"
              value={formData.numeroContrat}
              onChange={onChange}
              className={`cb-input ${errors.numeroContrat ? 'cb-error' : ''}`}
              placeholder="Ex: 123456"
            />
            {errors.numeroContrat && <div className="cb-msg">{errors.numeroContrat}</div>}
          </div>

          <div className="cb-field">
            <label className="cb-label">N° Affiliation *</label>
            <input
              name="numeroAffiliation"
              value={formData.numeroAffiliation}
              onChange={onChange}
              className={`cb-input ${errors.numeroAffiliation ? 'cb-error' : ''}`}
              placeholder="Ex: 7890"
            />
            {errors.numeroAffiliation && <div className="cb-msg">{errors.numeroAffiliation}</div>}
          </div>

          <div className="cb-field">
            <label className="cb-label">Nom *</label>
            <input
              name="nomBeneficiaire"
              value={formData.nomBeneficiaire}
              onChange={onChange}
              className={`cb-input ${errors.nomBeneficiaire ? 'cb-error' : ''}`}
              placeholder="Nom"
            />
            {errors.nomBeneficiaire && <div className="cb-msg">{errors.nomBeneficiaire}</div>}
          </div>

          <div className="cb-field">
            <label className="cb-label">Prénom *</label>
            <input
              name="prenomBeneficiaire"
              value={formData.prenomBeneficiaire}
              onChange={onChange}
              className={`cb-input ${errors.prenomBeneficiaire ? 'cb-error' : ''}`}
              placeholder="Prénom"
            />
            {errors.prenomBeneficiaire && <div className="cb-msg">{errors.prenomBeneficiaire}</div>}
          </div>

          <div className="cb-field">
            <label className="cb-label">Date de naissance *</label>
            <input
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={onChange}
              className={`cb-input ${errors.dateNaissance ? 'cb-error' : ''}`}
            />
            {errors.dateNaissance && <div className="cb-msg">{errors.dateNaissance}</div>}
          </div>

          <div className="cb-field">
            <label className="cb-label">Sexe *</label>
            <select
              name="sexeCode"
              value={formData.sexeCode}
              onChange={onChange}
              className={`cb-input ${errors.sexeCode ? 'cb-error' : ''}`}
            >
              <option value="">-- Choisir --</option>
              <option value="M">Homme</option>
              <option value="F">Femme</option>
            </select>
            {errors.sexeCode && <div className="cb-msg">{errors.sexeCode}</div>}
          </div>

          <div className="cb-field">
            <label className="cb-label">Type bénéficiaire *</label>
            <select
              name="typeBeneficiaireCode"
              value={formData.typeBeneficiaireCode}
              onChange={onChange}
              className={`cb-input ${errors.typeBeneficiaireCode ? 'cb-error' : ''}`}
            >
              <option value="">-- Choisir --</option>
              <option value="ENFANT">Enfant</option>
              <option value="CONJOINT">Conjoint</option>
            </select>
            {errors.typeBeneficiaireCode && <div className="cb-msg">{errors.typeBeneficiaireCode}</div>}
          </div>
        </div>

        <div className="cb-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save className={`icon ${loading ? 'spin' : ''}`} />
            {loading ? 'Création...' : 'Ajouter le bénéficiaire'}
          </button>
        </div>
      </form>
    </div>
  );
}
