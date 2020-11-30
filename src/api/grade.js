import request from '@/utils/request'

export function getGradePeople (gradeId) {
  return request({
    url: '/grade/people',
    method: 'get',
    params: {
      gradeId
    }
  })
}
