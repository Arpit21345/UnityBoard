import React from 'react';
import Modal from '../../../../components/Modal/Modal.jsx';

export default function LearningFormModal({ open, item, form, setForm, onClose, onSave }){
  function onKeyDown(e){
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      onSave();
    }
  }
  return (
    <Modal open={open} title={item ? 'Edit Learning Item' : 'New Learning Item'} onClose={onClose}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onSave}>Save Learning Item</button>
      </>}>
      <div className="learning-form" onKeyDown={onKeyDown}>
        <div className="learning-form-field">
          <label>Title *</label>
          <input 
            autoFocus 
            placeholder="Enter a descriptive title for your learning item" 
            value={form.title} 
            onChange={e=>setForm({ ...form, title:e.target.value })} 
          />
        </div>
        
        <div className="learning-form-field">
          <label>Description</label>
          <textarea 
            placeholder="Describe what you want to learn or accomplish" 
            value={form.description} 
            onChange={e=>setForm({ ...form, description:e.target.value })} 
            rows={3} 
          />
        </div>
        
        <div className="learning-form-row">
          <div className="learning-form-field">
            <label>Status</label>
            <select value={form.status} onChange={e=>setForm({ ...form, status:e.target.value })}>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div className="learning-form-field">
            <label>Due Date</label>
            <input 
              type="date" 
              value={form.dueDate} 
              onChange={e=>setForm({ ...form, dueDate:e.target.value })} 
            />
          </div>
        </div>
        
        <div className="learning-form-field">
          <label>Tags</label>
          <input 
            placeholder="Add tags separated by commas (e.g., javascript, react, frontend)" 
            value={form.tagsDraft} 
            onChange={e=>setForm({ ...form, tagsDraft:e.target.value })} 
          />
          <div className="learning-form-help">Use tags to categorize and filter your learning items</div>
        </div>
        
        <div className="learning-form-field">
          <label>Learning Materials</label>
          <textarea 
            placeholder="Add links to courses, articles, videos, books, etc. (one per line or comma separated)" 
            value={form.materialsDraft} 
            onChange={e=>setForm({ ...form, materialsDraft:e.target.value })} 
            rows={3} 
          />
          <div className="learning-form-help">URLs will be automatically formatted if they don't start with http/https</div>
        </div>
      </div>
    </Modal>
  );
}
