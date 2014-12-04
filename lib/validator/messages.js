'use strict';

module.exports = {
  after: '$0 must be after the date in field $1.',
  between: '$0 must be between $1 and $2 but not equal to $1 or $2.',
  equals: '$0 must equal $1.',
  fileType: 'The file must be one of the following types: $1.',
  format: '$0 must match the format $1.',
  greaterThan: '$0 must be greater than $1.',
  greaterThanEqual: '$0 must be greater than or equal to $1.',
  length: '$0 must be exactly $1 characters long.',
  lessThan: '$0 must be less than $1.',
  lessThanEqual: '$0 must be less than or equal to $1.',
  matches: '$0 must match $1.',
  maxSize: 'The file must be small or equal to $1kb',
  range: '$0 must be between $1 and $2.',
  required: '$0 is required.',
  requiredIfEmpty: '$0 is required, because $1 is empty.',
  requiredIfNotEmpty: '$0 is required, because $1 is not empty.',
  validDate: '$0 must be a valid date.'
};
