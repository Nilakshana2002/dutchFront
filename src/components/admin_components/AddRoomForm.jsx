import { useState } from 'react';
import Reveal from '../Reveal';

const AddRoomForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'deluxe',
    price: '',
    guests: '',
    description: '',
    tagline: '',
    features: '',
    image: '',
    images: '',
    view: 'ocean'
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Creating sanctuary...' });
    
    try {
      const roomData = {
        ...formData,
        price: Number(formData.price),
        guests: Number(formData.guests),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f !== ''),
        images: formData.images.split(',').map(i => i.trim()).filter(i => i !== '')
      };

      const response = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();

      if (data.success) {
        setStatus({ type: 'success', message: 'Sanctuary added to the collection successfully!' });
        setFormData({
          name: '',
          type: 'deluxe',
          price: '',
          guests: '',
          description: '',
          tagline: '',
          features: '',
          image: '',
          images: '',
          view: 'ocean'
        });
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to create room.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Connection error. Please ensure the backend is running.' });
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl shadow-2xl border border-navy-50">
      <Reveal width="100%">
        <h2 className="text-3xl font-bold text-navy-950 mb-8 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
          Create New Sanctuary
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-navy-400 mb-2">Room Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                placeholder="e.g. Sapphire Ocean Suite"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-navy-400 mb-2">Room Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:border-teal-500 outline-none transition-all"
              >
                <option value="deluxe">Deluxe</option>
                <option value="semiluxury">Semi-Luxury</option>
                <option value="luxury">Luxury</option>
                <option value="dayOuting">Day Outing</option>
                <option value="couple">Couple</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-navy-400 mb-2">Price per Night (LKR)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:border-teal-500 outline-none transition-all"
                placeholder="25000"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-navy-400 mb-2">Max Guests</label>
              <input
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:border-teal-500 outline-none transition-all"
                placeholder="2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-navy-400 mb-2">Features (Comma separated)</label>
            <input
              type="text"
              name="features"
              value={formData.features}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:border-teal-500 outline-none transition-all"
              placeholder="Air Conditioning, Free Wi-Fi, Ocean View, King Bed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-navy-400 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:border-teal-500 outline-none transition-all"
              placeholder="Describe the luxury and comfort..."
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-navy-400 mb-2">Primary Image URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:border-teal-500 outline-none transition-all"
                placeholder="https://images.unsplash.com/main..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-navy-400 mb-2">Gallery Images (Comma separated)</label>
              <input
                type="text"
                name="images"
                value={formData.images}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-navy-100 focus:border-teal-500 outline-none transition-all"
                placeholder="url1, url2, url3..."
              />
            </div>
          </div>

          {status.message && (
            <div className={`p-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-teal-50 text-teal-700' : 'bg-blue-50 text-blue-700'}`}>
              {status.message}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-navy-950 text-white rounded-2xl text-sm font-bold uppercase tracking-[0.3em] hover:bg-teal-600 shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Add Room to Collection
          </button>
        </form>
      </Reveal>
    </div>
  );
};

export default AddRoomForm;
