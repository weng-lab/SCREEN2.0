Building on the previous two examples, this example in Javascript uses the
[`graphql-request`](https://github.com/prisma-labs/graphql-request) library to
completely abstract over the underlying POST request.


```javascript
import { request } from 'graphql-request'

const query = `query cCREQuery($accession: [String!], $assembly: String!) { 
  cCREQuery(accession: $accession, assembly: $assembly) { 
    coordinates {
        start
        end
        chromosome
      } 
      rDHS
      assembly
      zScores {
        score
        experiment
        rDHS
      }
    }
}`
const variables = {
  accession: ["EH38E1516972"],
  assembly: "grch38"
}

request('https://factorbook.api.wenglab.org/graphql', query).then(data =>

)
```
which prints

```json
{
  "data": {
    "cCREQuery": [
      {
        "coordinates": {
          "start": 5280547,
          "end": 5280897,
          "chromosome": "chr11"
        },
        "rDHS": "EH38D2417606",
        "assembly": "grch38"
      }
    ]
  }
}

```