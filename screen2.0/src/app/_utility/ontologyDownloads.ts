export type DownloadLink = {
    label: string;
    filename: string;
  };
  
  export const ontologyDownloadMap: Record<string, DownloadLink[]> = {
    adipose: [
      { label: "Excluding Cancer Cell Lines", filename: "adipose.noccl.cCREs.bed" },
    ],
    adrenal_gland: [
      { label: "Excluding Cancer Cell Lines", filename: "adrenal_gland.noccl.cCREs.bed" },
    ],
    blood: [
      { label: "Excluding Cancer Cell Lines", filename: "blood.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "blood.all.cCREs.bed" },
    ],
    blood_vessel: [
      { label: "Excluding Cancer Cell Lines", filename: "blood_vessel.noccl.cCREs.bed" },
    ],
    bone: [
      { label: "Excluding Cancer Cell Lines", filename: "bone.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "bone.all.cCREs.bed" },
    ],
    bone_marrow: [
      { label: "Excluding Cancer Cell Lines", filename: "bone_marrow.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "bone_marrow.all.cCREs.bed" },
    ],
    brain: [
      { label: "Excluding Cancer Cell Lines", filename: "brain.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "brain.all.cCREs.bed" },
    ],
    breast: [
      { label: "Excluding Cancer Cell Lines", filename: "breast.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "breast.all.cCREs.bed" },
    ],
    connective_tissue: [
      { label: "Excluding Cancer Cell Lines", filename: "connective_tissue.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "connective_tissue.all.cCREs.bed" },
    ],
    embryo: [
      { label: "Excluding Cancer Cell Lines", filename: "embryo.noccl.cCREs.bed" },
    ],
    epithelium: [
      { label: "Excluding Cancer Cell Lines", filename: "epithelium.noccl.cCREs.bed" },
    ],
    esophagus: [
      { label: "Excluding Cancer Cell Lines", filename: "esophagus.noccl.cCREs.bed" },
    ],
    eye: [
      { label: "Excluding Cancer Cell Lines", filename: "eye.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "eye.all.cCREs.bed" },
    ],
    gallbladder: [
      { label: "Excluding Cancer Cell Lines", filename: "gallbladder.noccl.cCREs.bed" },
    ],
    heart: [
      { label: "Excluding Cancer Cell Lines", filename: "heart.noccl.cCREs.bed" },
    ],
    kidney: [
      { label: "Excluding Cancer Cell Lines", filename: "kidney.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "kidney.all.cCREs.bed" },
    ],
    large_intestine: [
      { label: "Excluding Cancer Cell Lines", filename: "large_intestine.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "large_intestine.all.cCREs.bed" },
    ],
    limb: [
      { label: "Excluding Cancer Cell Lines", filename: "limb.noccl.cCREs.bed" },
    ],
    liver: [
      { label: "Excluding Cancer Cell Lines", filename: "liver.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "liver.all.cCREs.bed" },
    ],
    lung: [
      { label: "Excluding Cancer Cell Lines", filename: "lung.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "lung.all.cCREs.bed" },
    ],
    lymphoid_tissue: [
      { label: "Excluding Cancer Cell Lines", filename: "lymphoid_tissue.noccl.cCREs.bed" },
    ],
    mouth: [
      { label: "Excluding Cancer Cell Lines", filename: "mouth.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "mouth.all.cCREs.bed" },
    ],
    muscle: [
      { label: "Excluding Cancer Cell Lines", filename: "muscle.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "muscle.all.cCREs.bed" },
    ],
    nerve: [
      { label: "Excluding Cancer Cell Lines", filename: "nerve.noccl.cCREs.bed" },
    ],
    nose: [
      { label: "Excluding Cancer Cell Lines", filename: "nose.noccl.cCREs.bed" },
    ],
    ovary: [
      { label: "Excluding Cancer Cell Lines", filename: "ovary.noccl.cCREs.bed" },
    ],
    pancreas: [
      { label: "Excluding Cancer Cell Lines", filename: "pancreas.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "pancreas.all.cCREs.bed" },
    ],
    parathyroid_gland: [
      { label: "Excluding Cancer Cell Lines", filename: "paraythroid_gland.noccl.cCREs.bed" },
    ],
    penis: [
      { label: "Excluding Cancer Cell Lines", filename: "penis.noccl.cCREs.bed" },
    ],
    placenta: [
      { label: "Excluding Cancer Cell Lines", filename: "placenta.noccl.cCREs.bed" },
    ],
    prostate: [
      { label: "Excluding Cancer Cell Lines", filename: "prostate.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "prostate.all.cCREs.bed" },
    ],
    skin: [
      { label: "Excluding Cancer Cell Lines", filename: "skin.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "skin.all.cCREs.bed" },
    ],
    small_intestine: [
      { label: "Excluding Cancer Cell Lines", filename: "small_intestine.noccl.cCREs.bed" },
    ],
    spinal_cord: [
      { label: "Excluding Cancer Cell Lines", filename: "spinal_cord.noccl.cCREs.bed" },
    ],
    spleen: [
      { label: "Excluding Cancer Cell Lines", filename: "spleen.noccl.cCREs.bed" },
    ],
    stomach: [
      { label: "Excluding Cancer Cell Lines", filename: "stomach.noccl.cCREs.bed" },
    ],
    testis: [
      { label: "Excluding Cancer Cell Lines", filename: "testis.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "testis.all.cCREs.bed" },
    ],
    thymus: [
      { label: "Excluding Cancer Cell Lines", filename: "thymus.noccl.cCREs.bed" },
    ],
    thyroid: [
      { label: "Excluding Cancer Cell Lines", filename: "thyroid.noccl.cCREs.bed" },
    ],
    urinary_bladder: [
      { label: "Excluding Cancer Cell Lines", filename: "urinary_bladder.noccl.cCREs.bed" },
    ],
    uterus: [
      { label: "Excluding Cancer Cell Lines", filename: "uterus.noccl.cCREs.bed" },
      { label: "All Biosamples", filename: "uterus.all.cCREs.bed" },
    ],
    vagina: [
      { label: "Excluding Cancer Cell Lines", filename: "vagina.noccl.cCREs.bed" },
    ],
  };
  