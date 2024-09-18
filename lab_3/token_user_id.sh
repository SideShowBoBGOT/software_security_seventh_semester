curl --request POST \
  --url https://dev-88qrd45kn4mz6ptn.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id":"zdzhN4dIDmIuptnArPhrZ4TEQAkQNGDH",
    "client_secret":"3e54llBevPi1cNu22Yr7ggExIntYXkJgs7_BZ5OTleTF1GFnT3eiOTrSlPkTLK4a",
    "audience":"https://dev-88qrd45kn4mz6ptn.us.auth0.com/api/v2/",
    "grant_type":"password",
    "username":"panchenko.serhii@lll.kpi.ua",
    "password":"IP11Panchenko",
    "scope":"offline_access openid profile"
}'