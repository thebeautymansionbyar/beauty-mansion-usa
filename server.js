const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const KOMMO_TOKEN = process.env.KOMMO_TOKEN;
const PIPELINE_ID = 13507143;
const API_BASE = 'https://api-c.kommo.com/api/v4';

// Stages USA
const STAGES = {
  'lead-frio-usa':             104207991,
  'cliente-interesado-usa':    104207995,
  'color-estilo-escogido-usa': 104207999,
  'fotos-pendientes-usa':      104208059,
  'esperando-cotizacion-usa':  104208063,
  'fotos-enviadas-usa':        104208067
};

app.use(express.json());
app.use(cors());

function getHeaders() {
  return {
    'Authorization': 'Bearer ' + KOMMO_TOKEN,
    'Content-Type': 'application/json'
  };
}

async function createLead(fullName) {
  const response = await axios.post(
    API_BASE + '/leads',
    {
      name: fullName,
      pipeline_id: PIPELINE_ID,
      status_id: STAGES['lead-frio-usa']
    },
    { headers: getHeaders() }
  );
  return response.data._embedded.leads[0].id;
}

async function updateLeadStatus(leadId, stageId) {
  await axios.patch(
    API_BASE + '/leads/' + leadId,
    { status_id: stageId },
    { headers: getHeaders() }
  );
}

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'Beauty Mansion USA Middleware',
    pipeline: PIPELINE_ID,
    token: KOMMO_TOKEN ? 'Configured' : 'MISSING'
  });
});

app.post('/webhook/lead-frio-usa', async (req, res) => {
  try {
    const { full_name } = req.body;
    if (!full_name) {
      return res.status(400).json({ success: false, error: 'full_name is required' });
    }
    const kommo_lead_id = await createLead(full_name);
    return res.status(201).json({ success: true, kommo_lead_id });
  } catch (error) {
    console.error('Webhook 1 error:', error.response ? JSON.stringify(error.response.data) : error.message);
    return res.status(502).json({ success: false, error: error.message });
  }
});

app.post('/webhook/cliente-interesado-usa', async (req, res) => {
  try {
    const { kommo_lead_id } = req.body;
    if (!kommo_lead_id) {
      return res.status(400).json({ success: false, error: 'kommo_lead_id is required' });
    }
    await updateLeadStatus(kommo_lead_id, STAGES['cliente-interesado-usa']);
    return res.status(200).json({ success: true, kommo_lead_id, status: 'CLIENTE INTERESADO' });
  } catch (error) {
    console.error('Webhook 2 error:', error.response ? JSON.stringify(error.response.data) : error.message);
    return res.status(502).json({ success: false, error: error.message });
  }
});

app.post('/webhook/color-estilo-escogido-usa', async (req, res) => {
  try {
    const { kommo_lead_id, tone, style } = req.body;
    if (!kommo_lead_id) {
      return res.status(400).json({ success: false, error: 'kommo_lead_id is required' });
    }
    await updateLeadStatus(kommo_lead_id, STAGES['color-estilo-escogido-usa']);
    return res.status(200).json({ success: true, kommo_lead_id, status: 'COLOR Y ESTILO', tone, style });
  } catch (error) {
    console.error('Webhook 3 error:', error.response ? JSON.stringify(error.response.data) : error.message);
    return res.status(502).json({ success: false, error: error.message });
  }
});

app.post('/webhook/fotos-pendientes-usa', async (req, res) => {
  try {
    const { kommo_lead_id } = req.body;
    if (!kommo_lead_id) {
      return res.status(400).json({ success: false, error: 'kommo_lead_id is required' });
    }
    await updateLeadStatus(kommo_lead_id, STAGES['fotos-pendientes-usa']);
    return res.status(200).json({ success: true, kommo_lead_id, status: 'FOTOS PENDIENTES' });
  } catch (error) {
    console.error('Webhook 4 error:', error.response ? JSON.stringify(error.response.data) : error.message);
    return res.status(502).json({ success: false, error: error.message });
  }
});

app.post('/webhook/esperando-cotizacion-usa', async (req, res) => {
  try {
    const { kommo_lead_id } = req.body;
    if (!kommo_lead_id) {
      return res.status(400).json({ success: false, error: 'kommo_lead_id is required' });
    }
    await updateLeadStatus(kommo_lead_id, STAGES['esperando-cotizacion-usa']);
    return res.status(200).json({ success: true, kommo_lead_id, status: 'ESPERANDO COTIZACION' });
  } catch (error) {
    console.error('Webhook 5 error:', error.response ? JSON.stringify(error.response.data) : error.message);
    return res.status(502).json({ success: false, error: error.message });
  }
});

app.post('/webhook/fotos-enviadas-usa', async (req, res) => {
  try {
    const { kommo_lead_id } = req.body;
    if (!kommo_lead_id) {
      return res.status(400).json({ success: false, error: 'kommo_lead_id is required' });
    }
    await updateLeadStatus(kommo_lead_id, STAGES['fotos-enviadas-usa']);
    return res.status(200).json({ success: true, kommo_lead_id, status: 'FOTOS ENVIADAS' });
  } catch (error) {
    console.error('Webhook 6 error:', error.response ? JSON.stringify(error.response.data) : error.message);
    return res.status(502).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Pipeline: ' + PIPELINE_ID);
  console.log('Token: ' + (KOMMO_TOKEN ? 'OK' : 'MISSING'));
});
