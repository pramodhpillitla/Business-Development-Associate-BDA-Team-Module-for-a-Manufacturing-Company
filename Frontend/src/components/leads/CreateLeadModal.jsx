import { useState } from "react";

const initialForm = {
  name: "",
  company: "",
  contactInfo: "",
  dealValue: "",
};

const CreateLeadModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await onCreate({
        ...form,
        dealValue: Number(form.dealValue || 0),
      });
      setForm(initialForm);
    } catch (createError) {
      setError(
        createError.response?.data?.message ||
          "Unable to create lead. Please check the details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4">
      <form
        className="w-full max-w-lg rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
              New Opportunity
            </p>
            <h2 className="mt-1 text-xl font-black">Create Lead</h2>
          </div>
          <button
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-zinc-300">
            Contact name
            <input
              className="h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-emerald-300"
              name="name"
              onChange={handleChange}
              required
              value={form.name}
            />
          </label>

          <label className="grid gap-2 text-sm text-zinc-300">
            Company
            <input
              className="h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-emerald-300"
              name="company"
              onChange={handleChange}
              required
              value={form.company}
            />
          </label>

          <label className="grid gap-2 text-sm text-zinc-300">
            Contact info
            <input
              className="h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-emerald-300"
              name="contactInfo"
              onChange={handleChange}
              placeholder="email or phone"
              required
              value={form.contactInfo}
            />
          </label>

          <label className="grid gap-2 text-sm text-zinc-300">
            Deal value
            <input
              className="h-11 rounded-lg border border-white/10 bg-white/5 px-3 text-white outline-none focus:border-emerald-300"
              min="0"
              name="dealValue"
              onChange={handleChange}
              type="number"
              value={form.dealValue}
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <button
          className="mt-5 h-11 w-full rounded-lg bg-emerald-300 font-bold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Creating..." : "Create lead"}
        </button>
      </form>
    </div>
  );
};

export default CreateLeadModal;
