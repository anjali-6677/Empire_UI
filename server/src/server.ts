import app from './app';
import { env } from './config/env';

const PORT = parseInt(env.PORT, 10) || 5000;

app.listen(PORT, () => {
  console.log(`[Empire ERP Auth Server] Server running on http://localhost:${PORT}`);
  console.log(`[Empire ERP Auth Server] Allowed Frontend URL: ${env.FRONTEND_URL}`);
});
