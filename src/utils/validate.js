
export function isExternal (path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

export function isUserName (userName) {
  return /^[\u4E00-\u9FA5a-zA-Z0-9_-]{2,10}$/.test(userName)
}

export function isFullName (fullName) {
  return /^[\u4E00-\u9FA5a-zA-Z]{2,10}$/.test(fullName)
}

export function isSchool (school) {
  return /^[\u4E00-\u9FA5a-zA-Z]{2,30}$/.test(school)
}

export function isMajor (major) {
  return /^[\u4E00-\u9FA5a-zA-Z]{2,15}$/.test(major)
}

export function isGrade (grade) {
  return /^[\u4E00-\u9FA5a-zA-Z0-9]{2,15}$/.test(grade)
}

export function isGradeId (gradeId) {
  return /^[a-z0-9]{32}$/.test(gradeId)
}

export function isStudentNumber (studentNumber) {
  return /^[0-9]{2,32}$/.test(studentNumber)
}

export function isPassword (password) {
  return /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/.test(password)
}

export function isTaskName (taskName) {
  return /^[\u4E00-\u9FA5a-zA-Z0-9]{2,20}$/.test(taskName)
}

export function isTaskContent (taskContent) {
  return /^[\u4E00-\u9FA5a-zA-Z0-9]{2,50}$/.test(taskContent)
}

export function isCheckedStudents (checkedStudents) {
  return checkedStudents.length > 0
}

export function isDeadline (deadline) {
  return Date.now() < new Date(deadline).getTime()
}

export function createValidateFn (testFn, err) {
  return (rule, value, callback) => {
    if (testFn(value)) {
      callback()
    } else {
      callback(new Error(err))
    }
  }
}
