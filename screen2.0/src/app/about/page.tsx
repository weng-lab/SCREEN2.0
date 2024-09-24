"use client"
import React, { useRef, useState } from "react"
import emailjs from '@emailjs/browser';
import { Box, Button, Divider, Link, Stack, TextField, Typography } from "@mui/material"
import Grid from "@mui/material/Grid2"
import Image from "next/image"
import encodeEncyclopedia from "../../../public/assets/about/images/encodeencyclopedia.png"
import classifications from "../../../public/assets/about/images/classifications.png"
import biosamples from "../../../public/assets/about/images/biosamples.png"
import { CA_CTCF, CA_H3K4me3, CA_TF, CA_only, PLS, TF_only, dELS } from "../../common/lib/colors";
import { CreateLink } from "../../common/lib/utility";

export default function About() {
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [error, setError] = useState({ name: false, email: false, message: false })
  const [success, setSuccess] = useState(false)

  const form = useRef();

  function isValidEmail(email) {
    //hopefully this is right, got it from ChatGPT
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  if (error.email && isValidEmail(contactEmail)) setError({ ...error, email: false })
  if (error.name && contactName) setError({ ...error, name: false })
  if (error.message && contactMessage) setError({ ...error, message: false })

  const handleSubmit = async () => {
    //Check fields to see if valid
    const newErrorState = { name: false, email: false, message: false }
    if (!contactName) newErrorState.name = true
    if (!isValidEmail(contactEmail)) newErrorState.email = true
    if (!contactMessage) newErrorState.message = true

    //If all fields valid: Try to send email and form fields, catch any error
    if (!newErrorState.name && !newErrorState.email && !newErrorState.message) {
      try {
        await sendEmail()
        setContactName('')
        setContactEmail('')
        setContactMessage('')
        setSuccess(true)
      } catch (error) {
        console.log(error)
        window.alert("Something went wrong, please try again soon" + '\n' + JSON.stringify(error))
      }
    }
    setError(newErrorState)
  }

  const sendEmail = () => {
    console.log(form.current);

    return new Promise((resolve, reject) => {
      emailjs.sendForm('service_m0zf8wa', 'template_15g5s3y', form.current, 'VU9U1vX9cAro8XtUK')
        .then((result) => {
          // console.log(result.text);
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };



  return (
    (<main>
      <Grid container spacing={3} sx={{ maxWidth: "min(70%, 1000px)", minWidth: "600px", mr: "auto", ml: "auto", mt: "3rem" }}>
        {/* Header */}
        <Grid size={12}>
          <Typography variant="h2">About SCREEN</Typography>
          <Divider />
          <Typography mt={1} variant="body1" paragraph>SCREEN (Search Candidate Regulatory Elements by ENCODE) is a web-based visualization engine designed to allow users to explore and visualize the <b>ENCODE Registry of candidate cis-Regulatory Elements (cCREs)</b> and its connection with other ENCODE Encyclopedia annotations.</Typography>
        </Grid>
        {/* Encode Encyclopedia */}
        <Grid container size={12}>
          <Grid
            size={{
              xs: 12,
              lg: 5
            }}>
            <Typography variant="h5">The ENCODE Encyclopedia</Typography>
            <Typography variant="body1" paragraph>The ENCODE Encyclopedia encompasses a comprehensive set of sequence (yellow), element (red), gene (green) and interaction (blue) annotations (<b>Figure&nbsp;1</b>). These annotations can either derive directly from primary data (primary level) or derive from the integration of multiple data types using innovative computational methods (integrative level). </Typography>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 7
            }}>
            <Image src={encodeEncyclopedia} alt={"Encode Encyclopedia"} />
          </Grid>
        </Grid>
        {/* Reistry of cCREs */}
        <Grid container size={12}>
          <Grid size={12}>
            <Typography variant="h5">
              The Registry of cCREs
            </Typography>
            <Typography variant="h6">
              Defining element anchors
            </Typography>
            <Typography variant="body1" paragraph>
              Previous versions of the Registry of cCREs were anchored on representative DNase Hypersensitivity Sites (rDHSs), regions that represent open chromatin sites across hundreds of cell and tissue types. In version 4, we combined over 178 million DHSs from across 1,438 DNase profiles to generate a set of 2.8 million rDHSs in human and 54 million DHSs from across 466 DNase profiles to generate a set of 1.3 million rDHSs in mouse.
            </Typography>
            <Typography variant="body1" paragraph>
              While these rDHSs account for the majority of biochemically active sites surveyed by the ENCODE project, there are specific transcription factors whose peaks have low overlap with open chromatin sites. These non-rDHS transcription factor binding sites are reproducible across cell types, contain high quality binding motifs, and are evolutionarily conserved. We hypothesize that these regions may have important regulatory activities and should be included as candidate cis-regulatory elements in our collection. Therefore, in version 4 of the Registry, we expanded our element anchoring scheme to also include reproducible transcription factor binding sites (which we refer to as transcription factor clusters). This resulted in an additional 86,748 element anchors in human and 7,658 anchors in mouse not previously captured by rDHSs.
            </Typography>
            <Typography variant="body1" paragraph>
              Additionally, our analysis found that cCREs in recently duplicated genomic regions were underrepresented in previous versions of the Registry because ENCODE uniform processing pipelines filter out multi-mapping reads. To fill in these gaps, we called DHSs from multi-mapping-inclusive alignments, which we used to generate a complementary set of <i>multi-mapper</i> rDHSs, 24,526 in human and 40,684 in mouse.
            </Typography>
            <Typography variant="h6">
              Defining high epigenomic signals
            </Typography>
            <Typography variant="body1" paragraph>
              For each anchor, we computed the Z-scores of the log10 of DNase, ATAC, H3K4me3, H3K27ac, and CTCF signals in each biosample with such data. Z-score computation is necessary for the signals to be comparable across biosamples because the uniform processing pipelines for DNase-seq and ChIP-seq data produce different types of signals. The DNase-seq signal is in sequencing-depth normalized read counts, whereas the ChIP-seq signal is the fold change of ChIP over input. Even for the ChIP-seq signal, which is normalized using a control experiment, substantial variation remains in the range of signals among biosamples.
            </Typography>
            <Typography variant="body1" paragraph>
              To implement this Z-score normalization, we used the UCSC tool bigWigAverageOverBed to compute the signal for each rDHS for a DNase, H3K4me3, H3K27ac, or CTCF experiment. For DNase and CTCF, the signal was averaged across the genomic positions in the rDHS. The signals of H3K4me3 and H3K27ac were averaged across an extended region—the rDHS plus a 500-bp flanking region on each side—to account for these histone marks at the flanking nucleosomes. We then took the log10 of these signals and computed a Z-score for each rDHS compared with all other rDHSs within a biosample. rDHSs with a raw signal of 0 were assigned a Z-score of -10. For all analyses we defined &quot;high signal&quot; as a Z-score greater than 1.64, a threshold corresponding to the 95th percentile of a one-tailed test. We define a max-Z of a rDHS as the maximum z-score for a signal across all surveyed biosamples.
            </Typography>
            <Typography variant="h6">
              Classification of cCREs
            </Typography>
            <Typography variant="body1" paragraph>
              Many uses of cCREs are based on the regulatory role associated with their biochemical signatures. Analogous to GENCODE&apos;s catalog of genes, which are defined irrespective of their varying expression levels and alternative transcripts across different cell types, we provide a general, cell type-agnostic classification of cCREs. This classification is based on each element&apos;s dominant biochemical signals across all available biosamples and its proximity to the nearest GENCODE transcription start site (TSS) (<b>Figure X</b>).
            </Typography>
            <Image src={classifications} alt="Classification of cCREs" />
            <Stack direction={"column"} spacing={1} mt={1} mb={1}>
              <Typography paddingLeft={"1rem"} borderLeft={`0.25rem solid ${PLS}`} variant="body1">
                <u>Promoter-like signatures (promoter)</u> must meet the following two criteria: 1) fall within 200 bp (center to center) of an annotated GENCODE TSS or experimentally derived TSS and 2) have high chromatin accessibility and H3K4me3 signals.
              </Typography>
              <Typography paddingLeft={"1rem"} borderLeft={`0.25rem solid ${dELS}`} variant="body1">
                <u>Enhancer-like signatures (enhancer)</u> have high chromatin accessibility and H3K27ac signals. If they are within 200 bp of a TSS they must also have low H3K4me3 signal. The subset of the enhancers within 2 kb of a TSS are denoted as TSS proximal (proximal enhancers), while the remaining subset is denoted TSS distal (distal enhancers).
              </Typography>
              <Typography paddingLeft={"1rem"} borderLeft={`0.25rem solid ${CA_H3K4me3}`} variant="body1">
                <u>Chromatin accessibility + H3K4me3 (CA-H3K4me3)</u> have high chromatin accessibility and H3K4me3 signals, low H3K27ac signals and do not fall within 200 bp of a TSS.
              </Typography>
              <Typography paddingLeft={"1rem"} borderLeft={`0.25rem solid ${CA_CTCF}`} variant="body1">
                <u>Chromatin accessibility + CTCF (CA-CTCF)</u> have high chromatin accessibility and CTCF signals, low H3K4me3 and H3K27ac signals.
              </Typography>
              <Typography paddingLeft={"1rem"} borderLeft={`0.25rem solid ${CA_TF}`} variant="body1">
                <u>Chromatin accessibility + transcription factor (CA-TF)</u> have high chromatin accessibility, low H3K4me3 H3K27ac, and CTCF signals, and overlap a transcription factor cluster.
              </Typography>
              <Typography paddingLeft={"1rem"} borderLeft={`0.25rem solid ${CA_only}`} variant="body1">
                <u>Chromatin accessibility (CA)</u> have high chromatin accessibility, and low H3K4me3, H3K27ac, and CTCF signals.
              </Typography>
              <Typography paddingLeft={"1rem"} borderLeft={`0.25rem solid ${TF_only}`} variant="body1">
                <u>Transcription factor (TF)</u> have low chromatin accessibility, H3K4me3, H3K27ac, and CTCF signals and overlap a transcription factor cluster.
              </Typography>
            </Stack>
            <Typography variant="body1" paragraph>
              In addition to the cell type-agnostic classification described above, we also evaluated the biochemical activity of each cCRE in individual biosamples using the corresponding biosample-specific DNase, H3K4me3, H3K27ac, and CTCF data. This allows us to annotate active cCREs in individual biosamples including promoter, enhancer, CA-H3K4me3, CA-CTCF, and CA cCREs. Elements with low DNase Z-scores in individual biosamples are deemed to be inactive and are labeled with “Low Chromatin Accessibility.”
            </Typography>
            <Typography variant="body1" paragraph>
              Because of the uneven distribution of TF data across biosamples and our desire to reduce false positive annotations, we do not specifically annotate the TF class of elements in individual cell types. We instead provide an aggregate list of these TF cCREs annotated with their supporting TF ChIP-seq peaks. For cell types with TF ChIP-seq data, we annotate CA-TF elements since the accessible chromatin corroborates the TF binding.
            </Typography>
          </Grid>
        </Grid>
        <Grid container size={12}>
          <Grid size={12}>
            <Typography variant="h6">
              Core Collection
            </Typography>
            <Typography variant="body1" paragraph>
              Thanks to the extensive coordination efforts by the ENCODE4 Biosample Working Group, 171 biosamples have DNase, H3K4me3, H3K27ac, and CTCF data. We refer to these samples as the biosample-specific <i>Core Collection</i> of cCREs. These samples cover a variety of tissues and organs and primarily comprise primary tissues and cells (<b>Figure X</b>). We suggest that users prioritize these samples for their analysis as they contain all the relevant marks for the most complete annotation of cCREs.
              </Typography>
            <Image src={biosamples} style={{maxWidth: "600px", margin: "auto"}} alt="Biosample types visual diagram" />
            <Typography variant="h6">
              Partial Data Collection
              </Typography>
            <Typography variant="body1" paragraph>
              To supplement this <i>Core Collection</i>, 1,154 biosamples have DNase in addition to various combinations of the other marks (but not all three). Though we are unable to annotate the full spectrum of cCRE classes in these biosamples, having DNase enables us to annotate element boundaries with high resolution. Therefore, we refer to this group as the <i>Partial Data Collection</i>. In these biosamples, we classify elements using the available marks. For example, if a sample lacks H3K27ac and CTCF, its cCREs can only be assigned to the promoter, CA-H3K4me3, and CA groups, not the enhancer or CA-CTCF groups. The <i>Partial Data Collection</i> contains some unique tissues and cell states that are not represented in the <i>Core Collection</i>, such as fetal brain tissue and stimulated immune cells that may be of high interest to some researchers. Therefore, if users are interested in cCRE annotations in such biosamples, we suggest leveraging the cell type-agnostic annotations or annotations from similar biosamples in the <i>Core Collection</i>, to supplement their analyses.
            </Typography>
            <Typography variant="h6">
              Ancillary Collection
            </Typography>
            <Typography variant="body1" paragraph>
              For the 563 biosamples lacking DNase data, we do not have the resolution to identify specific elements and we refer to these annotations as the <i>Ancillary Collection</i>. In these biosamples, we simply label cCREs as having a high or low signal for every available assay. We highly suggest that users do not use annotations from the <i>Ancillary Collection</i> unless they are anchoring their analysis on cCREs from the <i>Core Collection</i> or <i>Partial Data Collection</i>.
            </Typography>
            <Typography variant="body1" paragraph>
              In both SCREEN’s visualization tools and downloadable files, we annotate biosamples based on their collection and available data.
            </Typography>
            <Typography variant="h6">Custom Classification</Typography>
            <Typography variant="body1" paragraph>While our classification schemes place each cCRE into specific, individual classes, the signal strengths for all recorded epigenetic features are retained for each cCRE in the Registry and can be used for customized searches by users. For example, users may want promoters that have high DNase, H3K4me3, and H3K27ac to distinguish from poised promoters that often lack H3K27ac signal.</Typography>
            <Typography variant="body1" paragraph>Additionally, by default, all chromatin accessibility annotations use DNase signal. If users prefer to use ATAC signal, this can be easily accomplished using the ENCODE API.</Typography>
          </Grid>
          <Grid container size={12}>
            <Grid size={12}>
              <Typography variant="h5">Integration with other encyclopedia annotations</Typography>
              <Typography variant="body1" paragraph>In addition to hosting the Registry of cCREs, SCREEN also hosts other Encyclopedia annotations and displays them in the context of cCREs. Under the cCRE Details page for each cCRE are tabs displaying overlapping Encyclopedia annotations with links to their derived experiments or annotations. Such annotations include TF peaks, histone mark peaks, ChromHMM states, TSS derived from RAMPAGE and long read RNA-seq data, 3D chromatin interactions, and gene expression.</Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant="h5">How to Cite the ENCODE Encyclopedia, the Registry of cCREs, and SCREEN</Typography>
              <Typography variant="h6">The Registry of cCREs and SCREEN</Typography>
              <ul style={{ listStyleType: "circle", listStylePosition: "inside" }}>
                <li>
                  <Typography display={"inline"} variant="body1" paragraph>The ENCODE Project Consortium, Jill E. Moore, Michael J. Purcaro, Henry E. Pratt, Charles B. Epstein, Noam Shoresh, Jessika Adrian, et al. 2020. “Expanded Encyclopaedias of DNA Elements in the Human and Mouse Genomes.” Nature 583 (7818): 699–710.</Typography>
                </li>
              </ul>
              <Typography variant="h6">The ENCODE Encyclopedia</Typography>
              <ul style={{ listStyleType: "circle", listStylePosition: "inside" }}>
                <li>
                  <Typography display={"inline"} variant="body1" paragraph>The ENCODE Project Consortium, Jill E. Moore, Michael J. Purcaro, Henry E. Pratt, Charles B. Epstein, Noam Shoresh, Jessika Adrian, et al. 2020. “Expanded Encyclopaedias of DNA Elements in the Human and Mouse Genomes.” Nature 583 (7818): 699–710.</Typography>
                </li>
              </ul>
            </Grid>
          </Grid>
          {/* API Documentation */}
          <Grid id="api-documentation" size={12}>
            <Typography mb={1} variant="h2">API Documentation</Typography>
            <CreateLink linkPrefix={"https://weng-lab.github.io/SCREEN2.0/"} label={"SCREEN API Documentation"} showExternalIcon />
          </Grid>
          {/* Contact Us */}
          <Grid id="contact-us" size={12}>
            <Typography mb={1} variant="h2">Contact Us</Typography>
            <Typography mb={1} variant="body1">Send us a message and we&apos;ll be in touch!</Typography>
            <Typography mb={1} variant="body1">As this is a beta site, we would greatly appreciate any feedback you may have. Knowing how our users are using the site and documenting issues they may have are important to make this resource better and easier to use.</Typography>
            <Box mb={1}>
              <Typography display={"inline"} variant="body1">If you&apos;re experiencing an error/bug, feel free to&nbsp;</Typography>
              <Link display={"inline"} href="https://github.com/weng-lab/SCREEN2.0/issues" target="_blank" rel="noopener noreferrer">submit an issue on Github.</Link>
            </Box>
            <Box mb={2}>
              <Typography display={"inline"} variant="body1">If you would like to send an attachment, feel free to email us directly at&nbsp;</Typography>
              <Link display={"inline"} href="mailto:encode-screen@googlegroups.com" target="_blank" rel="noopener noreferrer">encode&#8209;screen@googlegroups.com</Link>
            </Box>
            <Box
              component="form"
              ref={form}
              id="contact-us"
              sx={{
                '& > :not(style)': { width: '50ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                required
                value={contactName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setContactName(event.target.value);
                }}
                error={error.name}
                name="user_name"
                type="text"
                sx={{ display: 'block', mb: 1 }}
                id="outlined-basic"
                label="Name"
                variant="outlined"
              />
              <TextField
                required
                value={contactEmail}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setContactEmail(event.target.value);
                }}
                error={error.email || contactEmail !== '' && !isValidEmail(contactEmail)}
                helperText={error.email && "Please enter a valid email"}
                name="user_email"
                type="email"
                sx={{ display: 'block', mb: 1 }}
                id="outlined-basic"
                label="Email"
                variant="outlined"
              />
              <TextField
                required
                value={contactMessage}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setContactMessage(event.target.value);
                }}
                error={error.message}
                name="message"
                type="text"
                fullWidth
                rows={4}
                sx={{ display: 'block' }}
                multiline id="outlined-basic"
                label="Message"
                variant="outlined"
              />
              <Button
                sx={{ mt: 1 }}
                variant="contained"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Box>
            {success && <Typography>Submitted successfully, thank you!</Typography>}
          </Grid>
        </Grid>
      </Grid>
    </main >)
  );
}