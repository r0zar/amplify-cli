import _ from 'lodash';

export const fetchPermissionCategories = permissionMap => {
  return _.keys(permissionMap);
};

export const fetchPermissionResourcesForCategory = (permissionMap, category: string) => {
  return _.keys(_.get(permissionMap, [category]));
};

export const fetchPermissionsForResourceInCategory = (permissionMap, category: string, resourceName: string, serviceType: string) => {
  const permissions = _.get(permissionMap, [category, resourceName]);
  // BACKWARDS COMPATIBILITY:
  // https://github.com/aws-amplify/amplify-cli/pull/5342
  // If AppSync and CRUD permissions, update to GraphQL
  if (serviceType == 'AppSync' && hasCRUDPermissions(permissions)) {
    console.log('Backwards compatibility');
    return updatePermissionsForBackwardsCompatibility(permissionMap, category, resourceName);
  } else {
    return permissions;
  }
};

const hasCRUDPermissions = permissions => {
  return permissions.includes('create') || permissions.includes('read') || permissions.includes('update') || permissions.includes('delete');
};

const updatePermissionsForBackwardsCompatibility = (permissionMap, category, resourceName) => {
  const permissions = _.get(permissionMap, [category, resourceName]);
  const newPermissions = [];
  // create || update || delete => mutation
  // read                       => query, subscription
  if (permissions.includes('create') || permissions.includes('update') || permissions.includes('delete')) {
    newPermissions.push('Mutation');
  }
  if (_.includes(permissions, 'read')) {
    newPermissions.push('Query');
    newPermissions.push('Subscription');
  }
  return newPermissions;
};
