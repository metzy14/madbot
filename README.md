# MadBot frontend

React site for MadBot. The API lives in the private [madbot-backend](https://github.com/metzy14/madbot-backend) repository and is not part of this app.

Production site: https://madbot-frontend.vercel.app

```bash
npm install
npm start
```

The dev server proxies API calls to `http://localhost:10000`. Set `REACT_APP_API_URL` only if the API is somewhere else.
