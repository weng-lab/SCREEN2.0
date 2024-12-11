import { Divider, Stack, styled, Tooltip, Typography, CircularProgress, IconOwnProps, TypographyProps } from '@mui/material'
import { gql } from '../../graphql/__generated__';
import { useLazyQuery } from '@apollo/client';
import { useMemo, Fragment, useState } from 'react';
import NextLink from 'next/link';
import { UrlObject } from 'url';
import { ArrowOutward } from '@mui/icons-material';

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

  const StyledTypography = styled((props: TypographyProps) =>
    <Typography variant='body2' display={"inline"} textAlign={"center"} color="white" {...props} />
  )(() => ({
    '&:hover': {
      textDecoration: "underline"
    }
  }));

  const iconProps: IconOwnProps = {
    fontSize: 'small',
    sx: { display: "inline-flex", verticalAlign: "middle", p: 0 }
  }

  const linkStyles = {
    flexGrow: 1,
    minWidth: '130px',
    display: 'flex',
    justifyContent: 'center',
    textDecoration: 'none'
  }

  return (
    <Tooltip
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      title={
        <Fragment>
          <Stack
            direction={"row"}
            gap={1}
            justifyContent={"space-between"}
            divider={<Divider orientation='vertical' flexItem sx={{ backgroundColor: 'white' }} />}
          >
            <NextLink href={geneExpressionLink} target='_blank' style={linkStyles}>
              <StyledTypography>
                View <i>{geneName}</i> Gene Expression
                <ArrowOutward {...iconProps} />
              </StyledTypography>
            </NextLink>
            {searchLink ?
              <NextLink href={searchLink} target='_blank' style={linkStyles}>
                <StyledTypography>
                  Search <i>{geneName}</i> on SCREEN
                  <ArrowOutward {...iconProps} />
                </StyledTypography>
              </NextLink>
              :
              <CircularProgress size={"2rem"} />
            }
          </Stack>
        </Fragment>
      }
    >
      <Typography variant='inherit' color='primary' {...typographyProps}><i>{geneName}</i></Typography>
    </Tooltip>
  )
}

export default GeneLink