export const Silencer_Studies = [
  {
      study: "Cai et al",
      value: "Cai-Fullwood-2021.Silencer-cCREs",
      pubmed_id: "33514712",
      pubmed_link: "https://pubmed.ncbi.nlm.nih.gov/33514712/",
      method: "H3K27me3-rich regions"
  },
  {
      study: "Pang et al",
      value: "Pang-Snyder-2020.Silencer-cCREs",
      pubmed_id: "32094911",
      pubmed_link: "https://pubmed.ncbi.nlm.nih.gov/32094911/",
      method: "ReSE screen"
  },
  {
      study: "Jayavelu et al",
      value: "Jayavelu-Hawkins-2020.Silencer-cCREs",
      pubmed_id: "32103011",
      pubmed_link: "https://pubmed.ncbi.nlm.nih.gov/32103011/",
      method: "STARR-seq"
  },
  {
      study: "Huan et al",
      value: "Huan-Ovcharenko-2019.Silencer-cCREs",
      pubmed_id: "30886051",
      pubmed_link: "https://pubmed.ncbi.nlm.nih.gov/30886051/",
      method: "H3K27me3 DNase hypersensitivity sites anti-correlated with gene expression"
  },
  {
      study:  "Moore et al",
      value: "REST-Enhancers",
      pubmed_id: "biorxiv",
      pubmed_link: "https://www.biorxiv.org/content/10.1101/2024.12.26.629296v1",
      method: "REST+ enhancer/silencers"
  },
  {
      study:  "Moore et al",
      value: "REST-Silencers",
      pubmed_id: "biorxiv",
      pubmed_link: "https://www.biorxiv.org/content/10.1101/2024.12.26.629296v1",
      method: "REST+ silencers"
  },
  {
      study:  "Moore et al",
      value: "STARR-Silencers.Robust",
      pubmed_id: "biorxiv",
      pubmed_link: "https://www.biorxiv.org/content/10.1101/2024.12.26.629296v1",
      method: "STARR silencer (robust)"
  },
  {
      study:  "Moore et al",
      value: "STARR-Silencers.Stringent",
      pubmed_id: "biorxiv",
      pubmed_link: "https://www.biorxiv.org/content/10.1101/2024.12.26.629296v1",
      method: "STARR silencer (stringent)"
  }
]
export const RampageToolTipInfo =
  "RAMPAGE (RNA Annotiation and Mapping of Promoters for Analysis of Gene Expression) data allows for the annotation of and expression at transcription start sites with nucleotide precision. Here, we display the sum of signal (from ENCODE Data Coordination Center's RAMPAGE pipeline) in a +-50bp window around GENCODE V19 annotated TSSs for the cRE's nearest protein coding gene. As, this signal is strand specific, we display signal from both the + and - strands for each experiment."

  