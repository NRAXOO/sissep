'use client';
import { useEffect, useState, useCallback } from 'react';
import { api, storageUrl }                  from '@/lib/api';
import StatusPill                           from '@/components/ui/StatusPill';
import Spinner                              from '@/components/ui/Spinner';
import Modal                                from '@/components/ui/Modal';
import { DocumentRecord, StudentProgress, ProgramType, DocStatus } from '@/types';

interface FilteredDoc extends DocumentRecord {
  studentName: string;
  controlNumber: string;
  section: string;
}

const PROGRAMS: { id: ProgramType; label: string }[] = [
  { id: 'servicio_social', label: 'Servicio Social' },
  { id: 'residencias',     label: 'Residencias Profesionales' },
];

export default function AdminPage() {
  const [program,    setProgram]    = useState<ProgramType>('servicio_social');
  const [students,   setStudents]   = useState<StudentProgress[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState<DocStatus | null>(null);
  const [filteredDocs, setFilteredDocs] = useState<FilteredDoc[]>([]);

  const [detail, setDetail] = useState<{
    student: StudentProgress;
    docs:    DocumentRecord[];
  } | null>(null);

  // Estado para el modal de edición de usuario
  const [editUser, setEditUser] = useState<{
    id: string;
    name: string;
    controlNumber: string;
    carrera: string;
    password: string;
  } | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [review, setReview] = useState<{
    doc:    DocumentRecord;
    action: 'aprobado' | 'rechazado';
  } | null>(null);
  const [reviewObs,     setReviewObs]     = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<StudentProgress[]>(
        `/documents/progress?programType=${program}`,
      );
      setStudents(data);
    } finally {
      setLoading(false);
    }
  }, [program]);

  const fetchFilteredDocs = useCallback(async (status: DocStatus) => {
    setLoading(true);
    try {
      const data = await api.get<FilteredDoc[]>(
        `/documents/filter?programType=${program}&status=${status}`,
      );
      setFilteredDocs(data);
      setFilterStatus(status);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  async function openDetail(student: any) {
    const studentId = student.id;
    if (!studentId) {
      alert('ID de estudiante no encontrado');
      return;
    }
    const docs = await api.get<DocumentRecord[]>(
      `/documents/student/${studentId}?programType=${program}`,
    );
    setDetail({ 
      student: {
        id: studentId,
        name: student.name || 'Estudiante',
        controlNumber: student.controlNumber || 'N/A',
        carrera: student.carrera || '',
        total: docs.length,
        approved: docs.filter((d) => d.status === 'aprobado').length,
        pending: docs.filter((d) => d.status === 'pendiente').length,
        rejected: docs.filter((d) => d.status === 'rechazado').length,
      }, 
      docs 
    });
  }

  async function confirmReview() {
    if (!review || !detail) return;
    setReviewLoading(true);
    try {
      await api.patch(`/documents/${review.doc.id}/review`, {
        status:       review.action,
        observations: reviewObs,
      });
      setReview(null);
      setReviewObs('');
      const docs = await api.get<DocumentRecord[]>(
        `/documents/student/${detail.student.id}?programType=${program}`,
      );
      setDetail((prev) => (prev ? { ...prev, docs } : null));
      fetchStudents();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleUpdateUser() {
    if (!editUser) return;
    setEditLoading(true);
    try {
      await api.patch(`/auth/students/${editUser.id}`, {
        name: editUser.name,
        controlNumber: editUser.controlNumber,
        carrera: editUser.carrera,
        password: editUser.password || undefined,
      });
      setEditUser(null);
      fetchStudents();
      alert('Usuario actualizado correctamente');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEditLoading(false);
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.controlNumber.includes(search),
  );

  const totalPending  = students.reduce((a, s) => a + s.pending, 0);
  const totalApproved = students.reduce((a, s) => a + s.approved, 0);
  const totalRejected = students.reduce((a, s) => a + s.rejected, 0);

  if (detail) {
    const { student, docs } = detail;
    const appCount = docs.filter((d) => d.status === 'aprobado').length;

    return (
      <div className="app-shell">
        <aside className="sidebar">
          <span className="sidebar-section-label">Programa</span>
          {PROGRAMS.map((p) => (
            <button
              key={p.id}
              className={`sidebar-nav-btn${program === p.id ? ' active' : ''}`}
              onClick={() => setProgram(p.id)}
              type="button"
            >
              {p.label}
            </button>
          ))}
          <div className="divider" />
          <span className="sidebar-section-label">Expediente</span>
          <div className="sidebar-stat">
            <span>Total</span>
            <strong>{docs.length}</strong>
          </div>
          <div className="sidebar-stat">
            <span>Aprobados</span>
            <strong style={{ color: 'var(--green)' }}>{appCount}</strong>
          </div>
          <div className="sidebar-stat">
            <span>Enviados</span>
            <strong style={{ color: 'var(--blue)' }}>
              {docs.filter((d) => d.status === 'enviado').length}
            </strong>
          </div>
          <div className="sidebar-stat">
            <span>Pendientes</span>
            <strong style={{ color: 'var(--amber)' }}>
              {docs.filter((d) => d.status === 'pendiente').length}
            </strong>
          </div>
          <div className="sidebar-stat">
            <span>Rechazados</span>
            <strong style={{ color: 'var(--red)' }}>
              {docs.filter((d) => d.status === 'rechazado').length}
            </strong>
          </div>
        </aside>
        <main className="content">
          <button className="back-btn" onClick={() => setDetail(null)} type="button">&larr; Volver a la lista</button>
          <div className="page-header">
            <h1 className="page-title">{student.name}</h1>
            <p className="page-subtitle">
              {student.controlNumber} &middot; {student.carrera || 'Sin carrera'} &middot;{' '}
              {program === 'servicio_social' ? 'Servicio Social' : 'Residencias Profesionales'}
            </p>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Estado</th>
                  <th>Archivo / Enlace</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ maxWidth: 200 }}>
                      <p className="doc-category">{doc.category}</p>
                      <p className="doc-description">{doc.description}</p>
                    </td>
                    <td><StatusPill status={doc.status} /></td>
                    <td style={{ maxWidth: 180 }}>
                      {doc.filePath && <a className="doc-file-link" href={storageUrl(doc.filePath)} target="_blank" rel="noreferrer">{doc.fileName}</a>}
                      {doc.externalUrl && <a className="doc-url-link" href={doc.externalUrl} target="_blank" rel="noreferrer">Enlace externo</a>}
                      {!doc.filePath && !doc.externalUrl && <span className="doc-empty">Sin enviar</span>}
                    </td>
                    <td style={{ maxWidth: 180 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{doc.observations || '—'}</span>
                    </td>
                    <td>
                      {(doc.filePath || doc.externalUrl) ? (
                        <div className="table-actions">
                          <button className="btn btn-success btn-sm" onClick={() => { setReview({ doc, action: 'aprobado' }); setReviewObs(''); }} type="button">Aprobar</button>
                          <button className="btn btn-danger btn-sm" onClick={() => { setReview({ doc, action: 'rechazado' }); setReviewObs(doc.observations || ''); }} type="button">Rechazar</button>
                        </div>
                      ) : (
                        <span className="doc-empty">Sin documento</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
        <Modal open={!!review} onClose={() => setReview(null)} title={review?.action === 'aprobado' ? 'Aprobar documento' : 'Rechazar documento'}>
          <p className="modal-description">{review?.doc.category}</p>
          <div className="field">
            <label>{review?.action === 'rechazado' ? 'Motivo del rechazo (visible para el estudiante)' : 'Observacion opcional'}</label>
            <textarea className="input" rows={4} placeholder={review?.action === 'rechazado' ? 'Describe el motivo para que el estudiante pueda corregirlo...' : 'Comentario opcional...'} value={reviewObs} onChange={(e) => setReviewObs(e.target.value)} />
          </div>
          <div className="modal-footer">
            <button className={`btn ${review?.action === 'aprobado' ? 'btn-success' : 'btn-danger'}`} onClick={confirmReview} disabled={reviewLoading} type="button">
              {reviewLoading ? 'Guardando...' : review?.action === 'aprobado' ? 'Confirmar aprobacion' : 'Confirmar rechazo'}
            </button>
            <button className="btn btn-secondary" onClick={() => setReview(null)} type="button">Cancelar</button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <span className="sidebar-section-label">Programa</span>
        {PROGRAMS.map((p) => (
          <button key={p.id} className={`sidebar-nav-btn${program === p.id ? ' active' : ''}`} onClick={() => setProgram(p.id)} type="button">{p.label}</button>
        ))}
        <div className="divider" />
        <span className="sidebar-section-label">Estadisticas</span>
        <button 
          className={`sidebar-stat ${filterStatus === null ? 'active' : ''}`} 
          onClick={() => { setFilterStatus(null); setFilteredDocs([]); }}
          style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', color: 'inherit', fontFamily: 'inherit' }}
        >
          <span>Estudiantes</span>
          <strong style={{ color: 'var(--accent-hover)' }}>{filtered.length}</strong>
        </button>
        <button 
          className={`sidebar-stat ${filterStatus === 'pendiente' ? 'active' : ''}`} 
          onClick={() => fetchFilteredDocs('pendiente')}
          style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', color: 'inherit', fontFamily: 'inherit' }}
        >
          <span>Pendientes</span>
          <strong style={{ color: 'var(--amber)' }}>{totalPending}</strong>
        </button>
        <button 
          className={`sidebar-stat ${filterStatus === 'enviado' ? 'active' : ''}`} 
          onClick={() => fetchFilteredDocs('enviado')}
          style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', color: 'inherit', fontFamily: 'inherit' }}
        >
          <span>Enviados</span>
          <strong style={{ color: 'var(--blue)' }}>{students.reduce((a, s: any) => a + (s.sent || 0), 0)}</strong>
        </button>
        <button 
          className={`sidebar-stat ${filterStatus === 'aprobado' ? 'active' : ''}`} 
          onClick={() => fetchFilteredDocs('aprobado')}
          style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', color: 'inherit', fontFamily: 'inherit' }}
        >
          <span>Aprobados</span>
          <strong style={{ color: 'var(--green)' }}>{totalApproved}</strong>
        </button>
        <button 
          className={`sidebar-stat ${filterStatus === 'rechazado' ? 'active' : ''}`} 
          onClick={() => fetchFilteredDocs('rechazado')}
          style={{ textAlign: 'left', width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', color: 'inherit', fontFamily: 'inherit' }}
        >
          <span>Rechazados</span>
          <strong style={{ color: 'var(--red)' }}>{totalRejected}</strong>
        </button>
      </aside>
      <main className="content">
        {filterStatus ? (
          <div className="filtered-view">
            <div className="page-header">
              <h1 className="page-title">Documentos {filterStatus.toUpperCase()}</h1>
              <p className="page-subtitle">Mostrando todos los archivos de todos los estudiantes en este estado.</p>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>No. Control</th>
                    <th>Documento</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr style={{ textAlign: 'center' }}><td colSpan={5}>Cargando...</td></tr> : 
                   filteredDocs.length === 0 ? <tr style={{ textAlign: 'center' }}><td colSpan={5}>No hay documentos en este estado.</td></tr> :
                   filteredDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.studentName}</td>
                      <td>{doc.controlNumber}</td>
                      <td>{doc.category}</td>
                      <td><StatusPill status={doc.status} /></td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => openDetail({ id: doc.studentId, name: doc.studentName, controlNumber: doc.controlNumber, carrera: '', total: 0, approved: 0, pending: 0, rejected: 0 })} type="button">Ver Expediente</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="students-view">
            <div className="page-header">
              <h1 className="page-title">Lista de Estudiantes</h1>
              <p className="page-subtitle">
                {program === 'servicio_social' ? 'Servicio Social' : 'Residencias Profesionales'}
                {' — Haz clic en un estudiante para revisar su expediente.'}
              </p>
            </div>
            <input className="search-bar" placeholder="Buscar por nombre o numero de control..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {loading ? <Spinner /> : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">&#128193;</div>
                <p className="empty-state-text">No hay estudiantes registrados</p>
                <p className="empty-state-sub">Registra estudiantes desde /register</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No. Control</th>
                      <th>Nombre</th>
                      <th>Carrera</th>
                      <th>Progreso</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => {
                      const pct = s.total ? Math.round((s.approved / s.total) * 100) : 0;
                      const fillClass = pct === 100 ? 'high' : pct >= 50 ? 'mid' : 'low';
                      return (
                        <tr key={s.id} className="clickable" onClick={() => openDetail(s)}>
                          <td><span className="control-number">{s.controlNumber}</span></td>
                          <td style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</td>
                          <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.carrera || '—'}</td>
                          <td style={{ minWidth: 160 }}>
                            <div className="mini-progress">
                              <div className="mini-progress-bar">
                                <div className={`mini-progress-fill ${fillClass}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="mini-progress-frac">{s.approved}/{s.total}</span>
                            </div>
                          </td>
                          <td>
                            <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setEditUser({ id: s.id, name: s.name, controlNumber: s.controlNumber, carrera: s.carrera, password: '' }); }} type="button">Editar</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
      <Modal open={!!review} onClose={() => setReview(null)} title={review?.action === 'aprobado' ? 'Aprobar documento' : 'Rechazar documento'}>
        <p className="modal-description">{review?.doc.category}</p>
        <div className="field">
          <label>{review?.action === 'rechazado' ? 'Motivo del rechazo (visible para el estudiante)' : 'Observacion opcional'}</label>
          <textarea className="input" rows={4} placeholder={review?.action === 'rechazado' ? 'Describe el motivo para que el estudiante pueda corregirlo...' : 'Comentario opcional...'} value={reviewObs} onChange={(e) => setLreviewObs(e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className={`btn ${review?.action === 'aprobado' ? 'btn-success' : 'btn-danger'}`} onClick={confirmReview} disabled={reviewLoading} type="button">
            {reviewLoading ? 'Guardando...' : review?.action === 'aprobado' ? 'Confirmar aprobacion' : 'Confirmar rechazo'}
          </button>
          <button className="btn btn-secondary" onClick={() => setReview(null)} type="button">Cancelar</button>
        </div>
      </Modal>
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Editar Usuario">
        <div className="field">
          <label>Nombre Completo</label>
          <input className="input" value={editUser?.name} onChange={(e) => setEditUser({ ...editUser!, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Número de Control</label>
          <input className="input" value={editUser?.controlNumber} onChange={(e) => setEditUser({ ...editUser!, controlNumber: e.target.value })} />
        </div>
        <div className="field">
          <label>Carrera</label>
          <input className="input" value={editUser?.carrera} onChange={(e) => setEditUser({ ...editUser!, carrera: e.target.value })} />
        </div>
        <div className="field">
          <label>Nueva Contraseña (dejar vacío para no cambiar)</label>
          <input className="input" type="password" value={editUser?.password} onChange={(e) => setEditUser({ ...editUser!, password: e.target.value })} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleUpdateUser} disabled={editLoading} type="button">
            {editLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button className="btn btn-danger" onClick={async () => {
            if (confirm('¿Estás seguro de que deseas eliminar este alumno? Esta acción es irreversible.')) {
              try {
                await api.delete(`/auth/students/${editUser?.id}`);
                setEditUser(null);
                fetchStudents();
                alert('Usuario eliminado correctamente');
              } catch (e: any) {
                alert(e.message);
              }
            }
          }} type="button">Eliminar</button>
          <button className="btn btn-secondary" onClick={() => setEditUser(null)} type="button">Cancelar</button>
        </div>
      </Modal>
    </div>
  );
}
