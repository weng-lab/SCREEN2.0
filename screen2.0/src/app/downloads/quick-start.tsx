import {
  Typography,
  Button,
  Stack,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Autocomplete,
  TextField
} from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';

import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Downloads from "./page";
import Config from "../../config.json"
import { useMemo } from "react";

import { Biosample } from "../search/types";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  biosamples: any;
}

const top100Films = [
  { label: 'The Shawshank Redemption', year: 1994 },
  { label: 'The Godfather', year: 1972 },
  { label: 'The Godfather: Part II', year: 1974 },
  { label: 'The Dark Knight', year: 2008 },
  { label: '12 Angry Men', year: 1957 },
  { label: "Schindler's List", year: 1993 },
  { label: 'Pulp Fiction', year: 1994 },
  {
    label: 'The Lord of the Rings: The Return of the King',
    year: 2003,
  },
  { label: 'The Good, the Bad and the Ugly', year: 1966 },
  { label: 'Fight Club', year: 1999 },
  {
    label: 'The Lord of the Rings: The Fellowship of the Ring',
    year: 2001,
  },
  {
    label: 'Star Wars: Episode V - The Empire Strikes Back',
    year: 1980,
  },
  { label: 'Forrest Gump', year: 1994 },
  { label: 'Inception', year: 2010 },
  {
    label: 'The Lord of the Rings: The Two Towers',
    year: 2002,
  },
  { label: "One Flew Over the Cuckoo's Nest", year: 1975 },
  { label: 'Goodfellas', year: 1990 },
  { label: 'The Matrix', year: 1999 },
  { label: 'Seven Samurai', year: 1954 },
  {
    label: 'Star Wars: Episode IV - A New Hope',
    year: 1977,
  },
  { label: 'City of God', year: 2002 },
  { label: 'Se7en', year: 1995 },
  { label: 'The Silence of the Lambs', year: 1991 },
  { label: "It's a Wonderful Life", year: 1946 },
  { label: 'Life Is Beautiful', year: 1997 },
  { label: 'The Usual Suspects', year: 1995 },
  { label: 'Léon: The Professional', year: 1994 },
  { label: 'Spirited Away', year: 2001 },
  { label: 'Saving Private Ryan', year: 1998 },
  { label: 'Once Upon a Time in the West', year: 1968 },
  { label: 'American History X', year: 1998 },
  { label: 'Interstellar', year: 2014 },
  { label: 'Casablanca', year: 1942 },
  { label: 'City Lights', year: 1931 },
  { label: 'Psycho', year: 1960 },
  { label: 'The Green Mile', year: 1999 },
  { label: 'The Intouchables', year: 2011 },
  { label: 'Modern Times', year: 1936 },
  { label: 'Raiders of the Lost Ark', year: 1981 },
  { label: 'Rear Window', year: 1954 },
  { label: 'The Pianist', year: 2002 },
  { label: 'The Departed', year: 2006 },
  { label: 'Terminator 2: Judgment Day', year: 1991 },
  { label: 'Back to the Future', year: 1985 },
  { label: 'Whiplash', year: 2014 },
  { label: 'Gladiator', year: 2000 },
  { label: 'Memento', year: 2000 },
  { label: 'The Prestige', year: 2006 },
  { label: 'The Lion King', year: 1994 },
  { label: 'Apocalypse Now', year: 1979 },
  { label: 'Alien', year: 1979 },
  { label: 'Sunset Boulevard', year: 1950 },
  {
    label: 'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb',
    year: 1964,
  },
  { label: 'The Great Dictator', year: 1940 },
  { label: 'Cinema Paradiso', year: 1988 },
  { label: 'The Lives of Others', year: 2006 },
  { label: 'Grave of the Fireflies', year: 1988 },
  { label: 'Paths of Glory', year: 1957 },
  { label: 'Django Unchained', year: 2012 },
  { label: 'The Shining', year: 1980 },
  { label: 'WALL·E', year: 2008 },
  { label: 'American Beauty', year: 1999 },
  { label: 'The Dark Knight Rises', year: 2012 },
  { label: 'Princess Mononoke', year: 1997 },
  { label: 'Aliens', year: 1986 },
  { label: 'Oldboy', year: 2003 },
  { label: 'Once Upon a Time in America', year: 1984 },
  { label: 'Witness for the Prosecution', year: 1957 },
  { label: 'Das Boot', year: 1981 },
  { label: 'Citizen Kane', year: 1941 },
  { label: 'North by Northwest', year: 1959 },
  { label: 'Vertigo', year: 1958 },
  {
    label: 'Star Wars: Episode VI - Return of the Jedi',
    year: 1983,
  },
  { label: 'Reservoir Dogs', year: 1992 },
  { label: 'Braveheart', year: 1995 },
  { label: 'M', year: 1931 },
  { label: 'Requiem for a Dream', year: 2000 },
  { label: 'Amélie', year: 2001 },
  { label: 'A Clockwork Orange', year: 1971 },
  { label: 'Like Stars on Earth', year: 2007 },
  { label: 'Taxi Driver', year: 1976 },
  { label: 'Lawrence of Arabia', year: 1962 },
  { label: 'Double Indemnity', year: 1944 },
  {
    label: 'Eternal Sunshine of the Spotless Mind',
    year: 2004,
  },
  { label: 'Amadeus', year: 1984 },
  { label: 'To Kill a Mockingbird', year: 1962 },
  { label: 'Toy Story 3', year: 2010 },
  { label: 'Logan', year: 2017 },
  { label: 'Full Metal Jacket', year: 1987 },
  { label: 'Dangal', year: 2016 },
  { label: 'The Sting', year: 1973 },
  { label: '2001: A Space Odyssey', year: 1968 },
  { label: "Singin' in the Rain", year: 1952 },
  { label: 'Toy Story', year: 1995 },
  { label: 'Bicycle Thieves', year: 1948 },
  { label: 'The Kid', year: 1921 },
  { label: 'Inglourious Basterds', year: 2009 },
  { label: 'Snatch', year: 2000 },
  { label: '3 Idiots', year: 2009 },
  { label: 'Monty Python and the Holy Grail', year: 1975 },
];

//So I don't forget, I think that using PascalCase is useful when defining JSX-returning functions since JSX elements are PascalCase
function ComboBox(options: Biosample[], label: string, mode: "promoter" | "enhancer" | "ctcf") {
  return (
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={options}
      sx={{ width: 300 }}
      //This spread is giving a warning. Code comes from MUI. Can't remove it though or doesn't work...
      renderInput={(params) => <TextField {...params} label={label} />}
      //Replace underlines with space using regex
      getOptionLabel={(biosample: Biosample) => biosample.name.replace(/_/g, " ") + " — Exp ID: " + (((mode == "promoter") && biosample.h3k4me3) || ((mode == "enhancer") && biosample.h3k27ac) || ((mode === "ctcf") && biosample.ctcf))}
      blurOnSelect
    />
  );
}

export function QuickStart(props: TabPanelProps) {
  const biosamples = props.biosamples.data

  const humanPromoters: Biosample[] = useMemo(() => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x) => x.h3k4me3 !== null), [biosamples])
  const humanEnhancers: Biosample[] = useMemo(() => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x) => x.h3k27ac !== null), [biosamples])
  const humanCTCF: Biosample[] = useMemo(() => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x) => x.ctcf !== null), [biosamples])
  const mousePromoters: Biosample[] = useMemo(() => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x) => x.h3k4me3 !== null), [biosamples])
  const mouseEnhancers: Biosample[] = useMemo(() => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x) => x.h3k27ac !== null), [biosamples])
  const mouseCTCF: Biosample[] = useMemo(() => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x) => x.ctcf !== null), [biosamples])

  console.log(biosamples)
  console.log(humanPromoters)

  return (
    <div
      role="tabpanel"
      id={`simple-tabpanel-${0}`}
      aria-labelledby={`simple-tab-${0}`}
    >
      {props.value === 0 &&
        <Grid2 container spacing={2}>
          <Grid2 xs={6}>
            <Stack spacing={2}>
              <Typography>Human</Typography>
              <Button href={Config.Downloads.HumanCCREs} variant="contained" color="primary">Download All Human cCREs (hg38)</Button>
              <Button href={Config.Downloads.HumanPromoters} variant="contained" color="primary">Download Human Candidate Promoters (hg38)</Button>
              {ComboBox(humanPromoters, "Search for a Biosample", "promoter")}
              <Button href={Config.Downloads.HumanEnhancers} variant="contained" color="primary">Download Human Candidate Enhancers (hg38)</Button>
              {ComboBox(humanEnhancers, "Search for a Biosample", "enhancer")}
              <Button href="https://downloads.wenglab.org/Registry-V4/GRCh38-CTCF.bed" variant="contained" color="primary">Download Human CTCF-Bound cCREs (hg38)</Button>
              {ComboBox(humanCTCF, "Search for a Biosample", "ctcf")}
              <Button href={Config.Downloads.HumanGeneLinks} variant="contained" color="primary">Download Human cCRE-Gene Links (hg38)</Button>
            </Stack>
          </Grid2>
          <Grid2 xs={6}>
            <Stack spacing={2}>
              <Typography>Mouse</Typography>
              <Button href={Config.Downloads.MouseCCREs} variant="contained" color="primary">Download All Mouse cCREs (hg38)</Button>
              <Button href={Config.Downloads.MousePromoters} variant="contained" color="primary">Download Mouse Candidate Promoters (hg38)</Button>
              {ComboBox(mousePromoters, "Search for a Biosample", "promoter")}
              <Button href={Config.Downloads.MouseEnhancers} variant="contained" color="primary">Download Mouse Candidate Enhancers (hg38)</Button>
              {ComboBox(mouseEnhancers, "Search for a Biosample", "enhancer")}
              <Button href={Config.Downloads.MouseCTCF} variant="contained" color="primary">Download Mouse CTCF-Bound cCREs (hg38)</Button>
              {ComboBox(mouseCTCF, "Search for a Biosample", "ctcf")}
            </Stack>
          </Grid2>
        </Grid2>
      }
    </div>
  );
}