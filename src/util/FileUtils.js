export function getFileCompression(name) {
  if (name.endsWith("tar.gz")) {
    return 'tar.gz';
  } else if (name.endsWith(".gz")) {
    return 'gz';
  } else if (name.endsWith("bz2")) {
    return 'bz2';
  } else {
    return 'None';
  }
}


export function getMeshName(format, endianness, compressType, name) {
  let meshName;
  if ("aflr3" === format && endianness === "little") {
    meshName = "mesh.lb8.ugrid";
  } else if ("aflr3" === format && endianness === "big") {
    meshName = "mesh.b8.ugrid";
  } else {
    meshName = name;
  }
  if(compressType) {
    if (compressType.endsWith("gz")) {
      meshName = meshName + ".gz";
    } else if (compressType.endsWith("bz2")) {
      meshName = meshName + ".bz2";
    }
  }
  // console.log(`format:${format}, endianness: ${endianness}, compressType:${compressType}, meshName:${meshName}`);
  return meshName;
}