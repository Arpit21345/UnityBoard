import React, { useMemo, useState } from 'react';
import Spinner from '../../../components/ui/Spinner.jsx';
import { useToast } from '../../../components/Toast/ToastContext.jsx';
import { apiUploadResourceFile, apiDeleteResource, apiCreateResourceLink } from '../../../services/resources.js';

export default function ResourcesPanel({ projectId, resources, setResources, resourcesLoading }) {
  const { notify } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [linkForm, setLinkForm] = useState({ title:'', url:'' });
  const [resQuery, setResQuery] = useState('');
  const [resourcesProviderFilter, setResourcesProviderFilter] = useState('all');
  const [resView, setResView] = useState('grid');
  const [resSort, setResSort] = useState('name');
  const [resDir, setResDir] = useState('asc');

  const items = useMemo(()=> resources
    .filter(r => {
      const q = resQuery.trim().toLowerCase();
      if (!q) return true;
      const text = `${r.title||''} ${r.name||''} ${r.url||''}`.toLowerCase();
      return text.includes(q);
    })
    .filter(r => resourcesProviderFilter==='all' ? true : r.provider === resourcesProviderFilter)
  , [resources, resQuery, resourcesProviderFilter]);

  const itemsSorted = useMemo(()=> [...items].sort((a,b)=>{
    const getName = (x)=> (x.title || x.name || x.url || '').toString().toLowerCase();
    const getProv = (x)=> (x.provider || '').toString().toLowerCase();
    let va = resSort==='provider' ? getProv(a) : getName(a);
    let vb = resSort==='provider' ? getProv(b) : getName(b);
    if (va < vb) return resDir==='asc' ? -1 : 1;
    if (va > vb) return resDir==='asc' ? 1 : -1;
    return 0;
  }), [items, resSort, resDir]);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const uploaded = [];
    const MAX = 10 * 1024 * 1024;
    setUploading(true); setUploadProgress(0);
    let done = 0;
    for (const file of files) {
      if (file.size > MAX) { notify(`${file.name}: too large (>10MB)`, 'error'); continue; }
      try {
        const res = await apiUploadResourceFile(projectId, file);
        uploaded.push(res);
        done += 1; setUploadProgress(Math.round((done / files.length) * 100));
      } catch { notify(`Upload failed: ${file.name}`, 'error'); }
    }
    if (uploaded.length) { setResources([...uploaded, ...resources]); notify(`Uploaded ${uploaded.length} file(s)`, 'success'); }
    setUploading(false);
  }

  async function onFileInput(e) { await handleFiles(e.target.files); e.target.value = ''; }
  async function onDrop(e) { e.preventDefault(); setDragOver(false); await handleFiles(e.dataTransfer.files); }
  async function removeResource(resourceId) { try { await apiDeleteResource(projectId, resourceId); setResources(resources.filter(r => r._id !== resourceId)); notify('Resource deleted', 'success'); } catch { notify('Delete failed', 'error'); } }

  function renderFavicon(linkUrl) {
    try { const u = new URL(linkUrl); const ico = `${u.origin}/favicon.ico`; return <img src={ico} alt="" width={16} height={16} style={{ opacity:0.8 }} onError={(e)=>{ e.currentTarget.style.display='none'; }} />; }
    catch { return null; }
  }
  function renderResourceThumb(r) {
    const isImage = r.mime?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(r.url || '');
    const isPdf = r.mime === 'application/pdf' || /\.pdf$/i.test(r.url || '');
    if (isImage) return <img src={r.url} alt="" onError={(e)=>{ e.currentTarget.style.display='none'; }} />;
    if (isPdf) return <div className="filetype ext-pdf">PDF</div>;
    if (r.provider === 'external') return <div className="filetype ext-link">LINK</div>;
    let ext = '';
    try { const name = r.name || r.title || (new URL(r.url)).pathname.split('/').pop(); const idx = (name || '').lastIndexOf('.'); if (idx !== -1) ext = (name || '').slice(idx + 1).toLowerCase(); } catch {}
    const known = ['doc','docx','ppt','pptx','xls','xlsx','zip','rar','txt','csv'];
    const cls = known.includes(ext) ? `ext-${ext}` : '';
    return <div className={`filetype ${cls}`}>{(ext || 'FILE').toUpperCase()}</div>;
  }
  function getResourceExt(r) {
    if (r.mime?.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(r.url || '')) return 'image';
    if (r.mime === 'application/pdf' || /\.pdf$/i.test(r.url || '')) return 'pdf';
    try { const name = r.name || r.title || (new URL(r.url)).pathname.split('/').pop(); const idx = (name || '').lastIndexOf('.'); if (idx !== -1) return (name || '').slice(idx + 1).toLowerCase(); } catch {}
    return r.provider === 'external' ? 'link' : 'file';
  }
  function renderListTypeIcon(r) {
    const type = getResourceExt(r);
    if (type === 'image') return <span className="filetype ext-img">IMG</span>;
    if (type === 'pdf') return <span className="filetype ext-pdf">PDF</span>;
    if (type === 'link') return <span className="filetype ext-link">LINK</span>;
    const known = ['doc','docx','ppt','pptx','xls','xlsx','zip','rar','txt','csv'];
    const cls = known.includes(type) ? `ext-${type}` : '';
    return <span className={`filetype ${cls}`}>{type.toUpperCase()}</span>;
  }

  return (
    <section className="resources-panel">
      <div className="resources-header">
        <h3>Resources</h3>
        <span className="small muted">{resources.length} total</span>
      </div>
      <p className="small">Tip: Max upload size is ~10MB per file (server default).</p>
      <div className="res-actions">
        <label className="btn btn-primary">
          Select files
          <input type="file" multiple onChange={onFileInput} style={{ display:'none' }} />
        </label>
        {uploading && <div className="small" style={{ minWidth:120 }}>Uploading… {uploadProgress}%</div>}
        <div className={`dropzone ${dragOver ? 'over' : ''}`} onDragOver={(e)=>{ e.preventDefault(); setDragOver(true); }} onDragLeave={()=>setDragOver(false)} onDrop={onDrop}>
          Drag & drop files here
        </div>
      </div>
      <div className="resources-toolbar">
        <input placeholder="Search resources" value={resQuery} onChange={e=>setResQuery(e.target.value)} />
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <label className="small">Sort</label>
          <select value={resSort} onChange={e=>setResSort(e.target.value)}>
            <option value="name">Name</option>
            <option value="provider">Provider</option>
          </select>
          <button className="btn" onClick={()=>setResDir(d=> d==='asc'?'desc':'asc')} title="Toggle sort direction">{resDir==='asc'?'Asc':'Desc'}</button>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <label className="small">View</label>
          <button type="button" className={resView==='grid'?'btn btn-primary':'btn'} onClick={()=>setResView('grid')}>Grid</button>
          <button type="button" className={resView==='list'?'btn btn-primary':'btn'} onClick={()=>setResView('list')}>List</button>
          <label className="small">Provider</label>
          <select value={resourcesProviderFilter} onChange={e=>setResourcesProviderFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="upload">Upload</option>
            <option value="external">External</option>
          </select>
        </div>
      </div>
      <div className="link-adder">
        <input placeholder="Link title (optional)" value={linkForm.title} onChange={e=>setLinkForm({...linkForm, title:e.target.value})} />
        <input placeholder="https://example.com" value={linkForm.url} onChange={e=>setLinkForm({...linkForm, url:e.target.value})} />
        <button className="btn" onClick={async ()=>{ try { if(!linkForm.url) return; let url = linkForm.url.trim(); if (!/^https?:\/\//i.test(url)) url = `https://${url}`; const r = await apiCreateResourceLink(projectId, { title: linkForm.title, url }); setResources([r, ...resources]); setLinkForm({ title:'', url:'' }); notify('Link added','success'); } catch(_) { notify('Link add failed','error'); } }}>Add link</button>
      </div>
  {resourcesLoading ? <Spinner size={20} /> : null}
      {!resourcesLoading && itemsSorted.length === 0 && (
        <p className="small">No resources yet.</p>
      )}
      {itemsSorted.length > 0 && (
        resView === 'grid' ? (
          <div className="res-grid">
            {itemsSorted.map(r => (
              <div key={r._id} className="res-card">
                <div className="thumb">{renderResourceThumb(r)}</div>
                <div className="info">
                  <a className="title" href={r.url} target="_blank" rel="noreferrer">{r.title || r.name || r.url}</a>
                  <div className="meta">
                    <span className={`badge badge-${r.provider==='external'?'medium':'low'}`}>{r.provider}</span>
                    {r.provider === 'external' && renderFavicon(r.url)}
                  </div>
                </div>
                <div className="actions">
                  <button className="link danger" title="Delete" onClick={() => { if (confirm('Delete resource?')) removeResource(r._id); }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="res-table">
            <div className="res-table-head">
              <div className="col-name small">Name</div>
              <div className="col-prov small">Provider</div>
              <div className="col-type small">Type</div>
              <div className="col-actions small">Actions</div>
            </div>
            {itemsSorted.map(r => (
              <div key={r._id} className="res-table-row">
                <div className="col-name">
                  <div className="row-main">
                    {renderListTypeIcon(r)}
                    <a href={r.url} target="_blank" rel="noreferrer">{r.title || r.name || r.url}</a>
                  </div>
                </div>
                <div className="col-prov"><span className={`badge badge-${r.provider==='external'?'medium':'low'}`}>{r.provider}</span></div>
                <div className="col-type">{getResourceExt(r)}</div>
                <div className="col-actions">
                  <button className="link danger" onClick={() => { if (confirm('Delete resource?')) removeResource(r._id); }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  );
}
