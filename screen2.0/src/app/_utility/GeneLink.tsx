import { Divider, Stack, styled, Tooltip, Typography, CircularProgress, IconOwnProps, TypographyProps, LinkProps, Link } from '@mui/material'
import { gql } from '../../graphql/__generated__';
import { useLazyQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import NextLink from 'next/link';
import { UrlObject } from 'url';
import { ArrowOutward, OpenInNew } from '@mui/icons-material';

export interface GeneLinkProps {
  geneName: string,
  assembly: "GRCh38" | "mm10",
  typographyProps?: TypographyProps
}

const GET_GENE_COORDS = gql(`
  query getGeneLocation($name: String!, $assembly: String!) {
    gene(name: [$name], assembly: $assembly, version: 40) {
      coordinates {
        chromosome
        start
        end
      }
    }
  }
`)

const GeneLink = ({ geneName, assembly, typographyProps }: GeneLinkProps) => {
  const [open, setOpen] = useState<boolean>(false)

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    getGeneCoords()
    setOpen(true);
  };

  const [getGeneCoords, { data: dataCoords, loading: loadingCoords, error: errorCoords, called: coordsWereFetched }] = useLazyQuery(
    GET_GENE_COORDS,
    { variables: { name: geneName, assembly: assembly } }
  )

  const coordinates = dataCoords && dataCoords.gene.length > 0 && dataCoords.gene[0].coordinates

  const geneExpressionLink = `/applets/gene-expression?assembly=${assembly}&gene=${geneName}`

  const searchLink: UrlObject = useMemo(() => {
    return coordinates ? (
      {
        pathname: '/search',
        query: {
          assembly,
          chromosome: coordinates.chromosome,
          start: coordinates.start,
          end: coordinates.end,
          gene: geneName
        }
      }) : null
  }, [assembly, coordinates, geneName])

  const iconProps: IconOwnProps = {
    fontSize: 'inherit',
    sx: { display: "inline-flex", verticalAlign: "middle", ml: 0.5 }
  }

  const StyledLink = (props: LinkProps<typeof NextLink>) => {
    return <Link color='primary.contrastText' variant='body2' underline='hover' component={NextLink} target='_blank' {...props}/>
  }


  return (
    <Tooltip
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      title={
        <Stack
          direction={"row"}
          gap={1}
          justifyContent={"space-between"}
          divider={<Divider orientation='vertical' flexItem sx={{ backgroundColor: 'white' }} />}
        >
          <StyledLink href={geneExpressionLink}>
            View <i>{geneName}</i> Gene Expression
            <OpenInNew {...iconProps} />
          </StyledLink>

          {searchLink ?
            <StyledLink href={searchLink}>
              Search <i>{geneName}</i> on SCREEN
              <OpenInNew {...iconProps} />
            </StyledLink>
            :
            <CircularProgress size={"2rem"} />
          }
        </Stack>
      }
    >
      <Typography variant='inherit' color='primary' {...typographyProps}><i>{geneName}</i></Typography>
    </Tooltip>
  )
}

export default GeneLink