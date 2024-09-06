
The SCREEN API takes a query as JSON in the body of a POST request and returns a
JSON response. As mentioned before, the interactive playground allows copying
the `cURL` command for a given query. However, here, we'll give a simple `cURL`
command for reference.

The following command
```bash
curl 'https://factorbook.api.wenglab.org/graphql'\
 -H 'Content-Type: application/json'\
 -H 'Accept: application/json'\
 --data-binary '{"query":"{ cCREQuery(accession: EH38E1516972, assembly: grch38) { 
    coordinates {
        start
        end
        chromosome
      } 
      rDHS
      assembly
    } }"}'
```

returns

```json
{"data":{"cCREQuery":{"coordinates":{ "start":5280547, "end": 5280897, "chromosome": "chr1"}}}}
```

This response can be saved to as a `JSON` file. Additionally, it could be piped
into a JSON processing library (like [`jq`](https://stedolan.github.io/jq/)) to
be processed.
