Similar to the command-like query, this example will also uses a plain POST
request. However, in addition, this example uses the `requests` library in
python to provide a thin abstraction. It also shows how to include GraphQL
variables.

```python
import requests
variables = {
  "accession": ["EH38E1516972"],
  "assembly": "grch38"
}
query = """
query cCREQuery($accession: [String!], $assembly: String!) { 
  cCREQuery(accession: $accession, assembly: $assembly) { 
    coordinates {
        start
        end
        chromosome
      } 
      rDHS
      assembly
    }
}
"""
request = requests.post(
    'https://factorbook.api.wenglab.org/graphql',
    json={ 'query': query, 'variables': variables },
    headers={}
)
if request.status_code != 200:
    raise Exception("Query failed. Status code: {}.".format(request.status_code))
result = request.json()
print(result)
```

where the `result` is

```
{
    u'data': {
        u'cCREQuery': {
            u'coordinates': {
                u'start': 5280547,
                u'end': 5280897,
                u'chromosome': u'chr11'
            },
            u'rDHS': u'EH38D2417606',
            u'assembly': u'grch38'
        }
    }
}
```