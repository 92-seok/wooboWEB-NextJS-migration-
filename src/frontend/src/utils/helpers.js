// 지역 필터링 및 정렬
export const filterAndSortArea = (areaList, filterTerms) => {
  return areaList
    .filter(area => {
      if (Array.isArray(filterTerms)) {
        return filterTerms.some(term => area.title.includes(term))
      }
      return area.title.includes(filterTerms)
    })
    .toSorted((a, b) => a.title.localeCompare(b.title));
}

// 장비 상태 체크 함수 (정상: ErrorChk > '0')
export const idDeviceNormal = (device) => {
  return device.ErrorChk > '0';
};