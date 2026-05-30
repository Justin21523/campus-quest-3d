import http from 'http';

const services = [
  { name: 'Web', url: 'http://localhost:5173' },
  { name: 'API', url: 'http://localhost:3000/health' },
  { name: 'AI Service', url: 'http://localhost:8000/health' },
];

function checkService(service) {
  return new Promise((resolve) => {
    http.get(service.url, (res) => {
      resolve({ name: service.name, status: res.statusCode === 200 ? 'OK' : 'FAIL', code: res.statusCode });
    }).on('error', () => {
      resolve({ name: service.name, status: 'FAIL', code: 'ECONNREFUSED' });
    });
  });
}

async function runChecks() {
  console.log('Checking services health...\n');
  const results = await Promise.all(services.map(checkService));
  
  results.forEach(r => {
    console.log(`[${r.status}] ${r.name} (Code: ${r.code})`);
  });
}

runChecks();
