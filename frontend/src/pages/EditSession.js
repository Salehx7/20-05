import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function EditSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: "",
    enseignant: "",
    eleves: [],
  });
  const [enseignants, setEnseignants] = useState([]);
  const [eleves, setEleves] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [sessionRes, enseignantRes, elevesRes] = await Promise.all([
      axios.get(`/api/sessions/${id}`),
      axios.get("/api/enseignants"),
      axios.get("/api/eleves"),
    ]);

    setForm({
      nom: sessionRes.data.nom,
      enseignant: sessionRes.data.enseignant?._id || "",
      eleves: sessionRes.data.eleves?.map(e => e._id) || [],
    });
    setEnseignants(enseignantRes.data);
    setEleves(elevesRes.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (eleveId) => {
    setForm((prev) => {
      const exists = prev.eleves.includes(eleveId);
      return {
        ...prev,
        eleves: exists
          ? prev.eleves.filter((id) => id !== eleveId)
          : [...prev.eleves, eleveId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`/api/sessions/${id}`, form);
    navigate("/liste-sessions");
  };

  const handleDelete = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer cette session ?")) {
      await axios.delete(`/api/sessions/${id}`);
      navigate("/liste-sessions");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Modifier la Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-6 rounded">
        <div>
          <label className="block text-sm font-medium mb-1">Nom de la session</label>
          <input
            type="text"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Enseignant</label>
          <select
            name="enseignant"
            value={form.enseignant}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">-- Sélectionner --</option>
            {enseignants.map((ens) => (
              <option key={ens._id} value={ens._id}>
                {ens.nom} {ens.prenom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 mb-2">Élèves</label>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded p-2">
            {eleves.map((e) => (
              <label key={e._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.eleves.includes(e._id)}
                  onChange={() => handleCheckboxChange(e._id)}
                />
                <span>{e.nom} {e.prenom}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Supprimer
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditSession;
