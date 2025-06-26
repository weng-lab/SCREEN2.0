export type DownloadLink = {
    label: string;
    filename: string;
  };
  
  export const ontologyDownloadMap: Record<string, DownloadLink[]> = {
    adipose: [
      { label: "Non-cancerous Lines", filename: "adipose.noccl.cCREs.bed" },
    ],
    adrenal_gland: [
      { label: "Non-cancerous Lines", filename: "adrenal_gland.noccl.cCREs.bed" },
    ],
    blood: [
      { label: "Non-cancerous Lines", filename: "blood.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "blood.all.cCREs.bed" },
    ],
    blood_vessel: [
      { label: "Non-cancerous Lines", filename: "blood_vessel.noccl.cCREs.bed" },
    ],
    bone: [
      { label: "Non-cancerous Lines", filename: "bone.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "bone.all.cCREs.bed" },
    ],
    bone_marrow: [
      { label: "Non-cancerous Lines", filename: "bone_marrow.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "bone_marrow.all.cCREs.bed" },
    ],
    brain: [
      { label: "Non-cancerous Lines", filename: "brain.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "brain.all.cCREs.bed" },
    ],
    breast: [
      { label: "Non-cancerous Lines", filename: "breast.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "breast.all.cCREs.bed" },
    ],
    connective_tissue: [
      { label: "Non-cancerous Lines", filename: "connective_tissue.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "connective_tissue.all.cCREs.bed" },
    ],
    embryo: [
      { label: "Non-cancerous Lines", filename: "embryo.noccl.cCREs.bed" },
    ],
    epithelium: [
      { label: "Non-cancerous Lines", filename: "epithelium.noccl.cCREs.bed" },
    ],
    esophagus: [
      { label: "Non-cancerous Lines", filename: "esophagus.noccl.cCREs.bed" },
    ],
    eye: [
      { label: "Non-cancerous Lines", filename: "eye.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "eye.all.cCREs.bed" },
    ],
    gallbladder: [
      { label: "Non-cancerous Lines", filename: "gallbladder.noccl.cCREs.bed" },
    ],
    heart: [
      { label: "Non-cancerous Lines", filename: "heart.noccl.cCREs.bed" },
    ],
    kidney: [
      { label: "Non-cancerous Lines", filename: "kidney.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "kidney.all.cCREs.bed" },
    ],
    large_intestine: [
      { label: "Non-cancerous Lines", filename: "large_intestine.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "large_intestine.all.cCREs.bed" },
    ],
    limb: [
      { label: "Non-cancerous Lines", filename: "limb.noccl.cCREs.bed" },
    ],
    liver: [
      { label: "Non-cancerous Lines", filename: "liver.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "liver.all.cCREs.bed" },
    ],
    lung: [
      { label: "Non-cancerous Lines", filename: "lung.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "lung.all.cCREs.bed" },
    ],
    lymphoid_tissue: [
      { label: "Non-cancerous Lines", filename: "lymphoid_tissue.noccl.cCREs.bed" },
    ],
    mouth: [
      { label: "Non-cancerous Lines", filename: "mouth.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "mouth.all.cCREs.bed" },
    ],
    muscle: [
      { label: "Non-cancerous Lines", filename: "muscle.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "muscle.all.cCREs.bed" },
    ],
    nerve: [
      { label: "Non-cancerous Lines", filename: "nerve.noccl.cCREs.bed" },
    ],
    nose: [
      { label: "Non-cancerous Lines", filename: "nose.noccl.cCREs.bed" },
    ],
    ovary: [
      { label: "Non-cancerous Lines", filename: "ovary.noccl.cCREs.bed" },
    ],
    pancreas: [
      { label: "Non-cancerous Lines", filename: "pancreas.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "pancreas.all.cCREs.bed" },
    ],
    parathyroid_gland: [
      { label: "Non-cancerous Lines", filename: "paraythroid_gland.noccl.cCREs.bed" },
    ],
    penis: [
      { label: "Non-cancerous Lines", filename: "penis.noccl.cCREs.bed" },
    ],
    placenta: [
      { label: "Non-cancerous Lines", filename: "placenta.noccl.cCREs.bed" },
    ],
    prostate: [
      { label: "Non-cancerous Lines", filename: "prostate.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "prostate.all.cCREs.bed" },
    ],
    skin: [
      { label: "Non-cancerous Lines", filename: "skin.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "skin.all.cCREs.bed" },
    ],
    small_intestine: [
      { label: "Non-cancerous Lines", filename: "small_intestine.noccl.cCREs.bed" },
    ],
    spinal_cord: [
      { label: "Non-cancerous Lines", filename: "spinal_cord.noccl.cCREs.bed" },
    ],
    spleen: [
      { label: "Non-cancerous Lines", filename: "spleen.noccl.cCREs.bed" },
    ],
    stomach: [
      { label: "Non-cancerous Lines", filename: "stomach.noccl.cCREs.bed" },
    ],
    testis: [
      { label: "Non-cancerous Lines", filename: "testis.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "testis.all.cCREs.bed" },
    ],
    thymus: [
      { label: "Non-cancerous Lines", filename: "thymus.noccl.cCREs.bed" },
    ],
    thyroid: [
      { label: "Non-cancerous Lines", filename: "thyroid.noccl.cCREs.bed" },
    ],
    urinary_bladder: [
      { label: "Non-cancerous Lines", filename: "urinary_bladder.noccl.cCREs.bed" },
    ],
    uterus: [
      { label: "Non-cancerous Lines", filename: "uterus.noccl.cCREs.bed" },
      { label: "All Cell Lines", filename: "uterus.all.cCREs.bed" },
    ],
    vagina: [
      { label: "Non-cancerous Lines", filename: "vagina.noccl.cCREs.bed" },
    ],
  };
  