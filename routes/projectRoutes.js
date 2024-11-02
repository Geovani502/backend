const express = require('express');
const pool = require('../db');
const router = express.Router();

// Crear un nuevo proyecto
router.post('/', async (req, res) => {
  const { titulo, descripcion, completada = false, fecha_vencimiento, prioridad = 'media', asignado_a, categoria, costo_proyecto } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO projects (titulo, descripcion, completada, fecha_vencimiento, prioridad, asignado_a, categoria, costo_proyecto) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [titulo, descripcion, completada, fecha_vencimiento, prioridad, asignado_a, categoria, costo_proyecto]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Leer todos los proyectos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Leer un proyecto específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Actualizar un proyecto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, completada, fecha_vencimiento, prioridad, asignado_a, categoria, costo_proyecto } = req.body;

  try {
    const result = await pool.query(
      `UPDATE projects 
       SET titulo = $1, descripcion = $2, completada = $3, fecha_vencimiento = $4, prioridad = $5, asignado_a = $6, categoria = $7, costo_proyecto = $8
       WHERE id = $9 RETURNING *`,
      [titulo, descripcion, completada, fecha_vencimiento, prioridad, asignado_a, categoria, costo_proyecto, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar un proyecto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Marcar un proyecto como pagado
router.post('/:id/pagar', async (req, res) => {
  const { id } = req.params;

  try {
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    const project = projectResult.rows[0];

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.pagado) return res.status(400).json({ message: 'Project already paid' });

    const result = await pool.query(
      'UPDATE projects SET pagado = true WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({ message: 'Project marked as paid', project: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


