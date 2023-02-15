function sortByKey(arr, key, reverse) {
  let arrCopy = [...arr]

  arrCopy.sort((elem1, elem2) => {
    if (elem1[key] > elem2[key]) {
      return (reverse) ? -1 : 1
    }
    if (elem1[key] < elem2[key]) {
      return (reverse) ? 1 : -1
    }
    return 0
  })

  return arrCopy
}

function zeroPad(num, size) {
  let res = num.toString()
  while (res.length < size) {
    res = '0' + res
  }
  return res
}

function dateToString(date) {
  return [
    zeroPad(date.getFullYear(), 4),
    zeroPad(date.getMonth() + 1, 2),
    zeroPad(date.getDate(), 2),
  ].join('-')
}

function getToday() {
  const now = new Date()
  return dateToString(now)
}

export {
  sortByKey,
  zeroPad,
  dateToString,
  getToday,
}
