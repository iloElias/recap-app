export default function unsetArrayPosition(array, index) {
  const auxArray = [];
  array.forEach((element, arrIndex) => {
    if (arrIndex !== index) {
      auxArray.push(element);
    }
  });
  return auxArray;
}

export function removeNullsFromArray(array) {
  array.forEach((element, index) => {
    if (!element) {
      array = unsetArrayPosition(array, index);
    }
  });

  return array;
}
