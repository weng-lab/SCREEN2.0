"use client";
import { GenomeSearch, GenomeSearchProps, Result } from "@weng-lab/ui-components";

export type AutoCompleteProps = Partial<GenomeSearchProps>

/**
 * Redirects the user to the a new page based on the search result
 * @param props - The props for the GenomeSearch component
 */
export default function AutoComplete(props: AutoCompleteProps) {

  const handleSearchSubmit = (r: Result) => {

    let url = "";
    switch (r.type) {
      case "Gene":
        url = `/search?assembly=${props.assembly}&chromosome=${r.domain.chromosome}&start=${r.domain.start}&end=${r.domain.end}&gene=${r.title}&tssDistance=0`;
        break;
      case "cCRE":
        url = `/search?assembly=${props.assembly}&chromosome=${r.domain.chromosome}&start=${r.domain.start}&end=${r.domain.end}&accessions=${r.title}&page=2`;
        break;
      case "Coordinate":
        url = `/search?assembly=${props.assembly}&chromosome=${r.domain.chromosome}&start=${r.domain.start}&end=${r.domain.end}`;
        break;
      case "SNP":
        url = `/search?assembly=${props.assembly}&chromosome=${r.domain.chromosome}&start=${r.domain.start}&end=${r.domain.end}&snpid=${r.title}&snpDistance=0`;
        break;
    }
    window.open(url, '_self');
  };

  return (
    <GenomeSearch
      assembly={props.assembly}
      ccreLimit={3}
      showiCREFlag={false}
      queries={["Gene", "cCRE", "SNP", "Coordinate"]}
      onSearchSubmit={handleSearchSubmit}
      //This is needed to prevent the enter key press from triggering the onClick of the Menu IconButton
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      }}
      slotProps={{
        paper: {
          elevation: 1,
        },
      }}
      openOnFocus
      {...props}
    />
  );
}
