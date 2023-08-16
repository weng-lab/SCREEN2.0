import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { debounce } from "@mui/material/utils";
import { useRouter } from "next/navigation"

export type QueryResponse = [
    number,
    string[],
    any,
    [string, string, string, string, string, string][],
    string[]
  ];

const GENE_AUTOCOMPLETE_QUERY = `
query ($assembly: String!, $name_prefix: [String!], $limit: Int) {
    gene(assembly: $assembly, name_prefix: $name_prefix, limit: $limit) {
      name
      id
      coordinates {
        start
        chromosome
        end
      }
    }
  }  
 `;

export const GeneAutoComplete = (props) => {
  const [value, setValue] = React.useState<any>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState<string[]>([]);
  const [geneids, setGeneIds] = React.useState<
    { chrom: string; start: number; end: number; id: string; name: string }[]
  >([]);
  
  const router = useRouter()
  const [geneDesc, setgeneDesc] =
    React.useState<{ name: string; desc: string }[]>();

  React.useEffect(() => {
    const fetchData = async () => {
      let f = await Promise.all(
        options.map((gene) =>
          fetch(
            "https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search?authenticity_token=&terms=" +
              gene.toUpperCase()
          )
            .then((x) => x && x.json())
            .then((x) => {
              const matches =
                (x as QueryResponse)[3] &&
                (x as QueryResponse)[3].filter(
                  (x) => x[3] === gene.toUpperCase()
                );
              return {
                desc:
                  matches && matches.length >= 1
                    ? matches[0][4]
                    : "(no description available)",
                name: gene,
              };
            })
            .catch(() => {
              return { desc: "(no description available)", name: gene };
            })
        )
      );
      setgeneDesc(f);
    };

    options && fetchData();
  }, [options]);

  const onSearchChange = async (value: string) => {
    setOptions([]);
    const response = await fetch("https://ga.staging.wenglab.org/graphql", {
      method: "POST",
      body: JSON.stringify({
        query: GENE_AUTOCOMPLETE_QUERY,
        variables: {
          assembly: "GRCh38",
          name_prefix: value,
          limit: 1000,
        },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const genesSuggestion = (await response.json()).data?.gene;
    if (genesSuggestion && genesSuggestion.length > 0) {
      const r = genesSuggestion.map((g) => g.name);
      const g = genesSuggestion.map((g) => {
        return {
          chrom: g.coordinates.chromosome,
          start: g.coordinates.start,
          end: g.coordinates.end,
          id: g.id,
          name: g.name,
        };
      });
      setOptions(r);
      setGeneIds(g);
    } else if (genesSuggestion && genesSuggestion.length === 0) {
      setOptions([]);
      setGeneIds([]);
    }
  };

  const debounceFn = React.useCallback(debounce(onSearchChange, 500), []);
  const gridsize = props.gridsize || 5.5;
  return (
    <Grid container sx={{ mr: "1em", ml:"1em" }}>
      {props.showTitle && (
        <Grid item sm={12} md={12} lg={12} xl={12}>
          <Typography>Search gene:</Typography>
          <br />
        </Grid>
      )}
      <Grid item sm={gridsize} md={gridsize} lg={gridsize} xl={gridsize}>
        <Autocomplete
          id="gene-autocomplete"
          sx={{ width: 300, paper: { height: 200 } }}
          options={options}
          ListboxProps={{
            style: {
              maxHeight: "180px",
            },
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.defaultPrevented = true;
                console.log("value",value)
              value &&
                props.onSelected &&
                props.onSelected({
                  geneid: geneids
                    .find((g) => g.name === value)
                    ?.id.split(".")[0],
                  chromosome: geneids.find((g) => g.name === value)?.chrom,
                  start: geneids.find((g) => g.name === value)?.start,
                  end: geneids.find((g) => g.name === value)?.end,
                });
              if (value) 
              {
                let chrom = geneids.find((g) => g.name === value)?.chrom
                let start = geneids.find((g) => g.name === value)?.start
                let end  = geneids.find((g) => g.name === value)?.end
                router.push(`search?assembly=${props.assembly}&chromosome=${chrom}&start=${start}&end=${end}&gene=${value}`)
               
              }
               
            }
          }}
          value={value}
          onChange={(_: any, newValue: string | null) => {
            setValue(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            if (newInputValue != "") {
              debounceFn(newInputValue);
            }

            setInputValue(newInputValue);
          }}
          noOptionsText="e.g sox4,gapdh"
          renderInput={(params) => (
            <TextField {...params} label="Enter a gene name" InputLabelProps={{ shrink: true }} placeholder="e.g sox4,gapdh" fullWidth />
          )}
          renderOption={(props, option) => {
            return (
              <li {...props} key={props.id}>
                <Grid container alignItems="center">
                  <Grid
                    item
                    sx={{ width: "calc(100% - 44px)"}}
                  >
                    <Box component="span" sx={{ fontWeight: "regular" }}>
                      {option}
                    </Box>
                    {geneDesc && geneDesc.find((g) => g.name === option) && (
                      <Typography variant="body2" color="text.secondary">
                        {geneDesc.find((g) => g.name === option)?.desc}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </li>
            );
          }}
        />
      </Grid>
    </Grid>
  );
};
