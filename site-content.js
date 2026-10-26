/* Real customer content can be added here without changing the layout.
   A review has: { name, text, service?, source?, rating? }.
   Use rating only when supplied by the actual customer; it is never inferred.
   Set mediaIsReference to false only for verified Rreze Pastërtie work. */
window.RREZE_CONTENT = {
  mediaIsReference: false,
  comparison: {
    before: 'assets/mattress-before-original.jpg',
    after: 'assets/mattress-after-original.jpg',
    registration: {"before":{"width":1000,"height":1327},"after":{"width":1000,"height":1333},"homography":[-0.36187587349959016,-0.7636983692490242,1098.9817089716344,-0.06335692773594478,0.6710928282663972,438.41401444470705,-0.0007453316945388829,0.001034032644656647,1],"crop":{"x":300,"y":530,"width":410,"height":342}},
  },
  videos: [
    { src: 'assets/rreze-pastrim-perfundimtar.mp4', title: 'Vëmendje në çdo detaj', subtitle: 'Nga afër' },
    { src: 'assets/rreze-ne-pune.mp4', title: 'Kujdes, hap pas hapi', subtitle: 'Në veprim' },
    { src: 'assets/rreze-kuzhina-me-avull.mp4', title: 'Deri te prekja e fundit', subtitle: 'Me përkushtim' },
  ],
  reviews: [
    {
      name: 'Kliente',
      text: 'Shumë të kënaqura! Shtëpia kuti! Bëji komplimentet tona zonjave, i lumshin duart! Ju falënderojmë shumë!',
      service: 'Pastrim shtëpie',
      source: 'WhatsApp',
    },
    {
      name: 'Kliente',
      text: 'Po, shumë bukur dhe super pastër. Shumë faleminderit! Jam super e kënaqur.',
      source: 'Instagram',
    },
    {
      name: 'Kliente',
      text: 'Çdo gjë perfekt. Ju lumshin duart zonjave! Shumë e kënaqur jam.',
      source: 'WhatsApp',
    },
    {
      name: 'Kliente',
      text: 'Ju lumshin duart! Ju falënderoj shumë, shumë për punën e mundin tuaj!',
      service: 'Pastrim shtëpie',
      source: 'WhatsApp',
    },
  ],
};
