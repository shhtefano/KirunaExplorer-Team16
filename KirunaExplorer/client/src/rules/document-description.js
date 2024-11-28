export const scaleRules = {
  required: "Scale is required",
  minLength: {
    value: 3,
    message: "Scale must be at least 3 characters",
  },
};

export const issuanceRules = {
  required: "The date of issuance is required",
  minLength: {
    value: 4,
    message:
      "Please write the date in the correct format: YYYY, YYYY/MM, or YYYY/MM/DD",
  },
  pattern: {
    value: /^\d{4}(\/(0[1-9]|1[0-2])(\/([0-2][0-9]|3[0-1]))?)?$/,
    message: "Date must be in format YYYY, YYYY/MM, or YYYY/MM/DD",
  },
};


export const descriptionRules = {
  required: "A description is required",
  minLength: {
    value: 2,
    message: "Description must be at least 2 characters",
  },
  maxLength: {
    value: 1000,
    message: "Description must be less than 1000 characters",
  },
};

export const documentRules = {
  required: "A document title is required",
};
export const stakeholderRules = {
  requried: "You have to select a stakeholder",
};
export const typeRules = {
  required: "You have to select a document type",
};

export const connectionRules = {
  required: "You have to specifiy the number of connections",
};
