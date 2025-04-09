import { 
  useCreateAction as useCreateActionBase, 
  useUpdateAction as useUpdateActionBase, 
  useDeleteAction as useDeleteActionBase, 
  EntityConfig 
} from './utils';

// Configuration objects for different entity types
const cenadisConfig: EntityConfig = {
  entityName: 'cenadis',
  queryKey: 'cenadis',
  entityLabel: 'Institution Cenadi',
  entityLabelFeminine: true
};

const minesupsConfig: EntityConfig = {
  entityName: 'minesups',
  queryKey: 'minesups',
  entityLabel: 'Institution Minesup',
  entityLabelFeminine: true
};

const universitiesConfig: EntityConfig = {
  entityName: 'universities',
  queryKey: 'universities',
  entityLabel: 'Université',
  entityLabelFeminine: true
};

const ipesConfig: EntityConfig = {
  entityName: 'ipes',
  queryKey: 'ipes',
  entityLabel: 'Institution IPES',
  entityLabelFeminine: true
};

const branchesConfig: EntityConfig = {
  entityName: 'branches',
  queryKey: 'branches',
  entityLabel: 'Filière',
  entityLabelFeminine: true
};

const uesConfig: EntityConfig = {
  entityName: 'ues',
  queryKey: 'ues',
  entityLabel: 'UE',
  entityLabelFeminine: true
};

const levelsConfig: EntityConfig = {
  entityName: 'levels',
  queryKey: 'levels',
  entityLabel: 'Niveau',
  entityLabelFeminine: false
};

const usersConfig: EntityConfig = {
  entityName: 'users',
  queryKey: 'users',
  entityLabel: 'Utilisateur',
  entityLabelFeminine: false
};

const authorizationsConfig: EntityConfig = {
  entityName: 'authorizations',
  queryKey: 'authorizations',
  entityLabel: 'Autorisation',
  entityLabelFeminine: true
};

const profilesConfig: EntityConfig = {
  entityName: 'profiles',
  queryKey: 'profiles',
  entityLabel: 'Profil',
  entityLabelFeminine: false
};

// Export hooks with specific configurations
export const useCreateCenadi = <T extends { id?: string }>(props?: Partial<EntityConfig>) => 
  useCreateActionBase<T>({ ...cenadisConfig, ...props });

export const useUpdateCenadi = <T extends { id: string }>(props?: Partial<EntityConfig>) => 
  useUpdateActionBase<T>({ ...cenadisConfig, ...props });

export const useDeleteCenadi = (props?: Partial<EntityConfig>) => 
  useDeleteActionBase({ ...cenadisConfig, ...props });

// Generic action hooks that can be used for any entity
export function useCreateAction<T extends { id?: string }>(config: EntityConfig) {
  return useCreateActionBase<T>(config);
}

export function useUpdateAction<T extends { id: string }>(config: EntityConfig) {
  return useUpdateActionBase<T>(config);
}

export function useDeleteAction(config: EntityConfig) {
  return useDeleteActionBase(config);
}

// Minesup hooks
export const useCreateMinesup = <T extends { id?: string }>(props?: Partial<EntityConfig>) => 
  useCreateActionBase<T>({ ...minesupsConfig, ...props });

export const useUpdateMinesup = <T extends { id: string }>(props?: Partial<EntityConfig>) => 
  useUpdateActionBase<T>({ ...minesupsConfig, ...props });

export const useDeleteMinesup = (props?: Partial<EntityConfig>) => 
  useDeleteActionBase({ ...minesupsConfig, ...props });

// University hooks  
export const useCreateUniversity = <T extends { id?: string }>(props?: Partial<EntityConfig>) => 
  useCreateActionBase<T>({ ...universitiesConfig, ...props });

export const useUpdateUniversity = <T extends { id: string }>(props?: Partial<EntityConfig>) => 
  useUpdateActionBase<T>({ ...universitiesConfig, ...props });

export const useDeleteUniversity = (props?: Partial<EntityConfig>) => 
  useDeleteActionBase({ ...universitiesConfig, ...props });

// Ipes hooks
export const useCreateIpes = <T extends { id?: string }>(props?: Partial<EntityConfig>) => 
  useCreateActionBase<T>({ ...ipesConfig, ...props });

export const useUpdateIpes = <T extends { id: string }>(props?: Partial<EntityConfig>) => 
  useUpdateActionBase<T>({ ...ipesConfig, ...props });

export const useDeleteIpes = (props?: Partial<EntityConfig>) => 
  useDeleteActionBase({ ...ipesConfig, ...props });

// Branch hooks
export const useCreateBranch = <T extends { id?: string }>(props?: Partial<EntityConfig>) => 
  useCreateActionBase<T>({ ...branchesConfig, ...props });

export const useUpdateBranch = <T extends { id: string }>(props?: Partial<EntityConfig>) => 
  useUpdateActionBase<T>({ ...branchesConfig, ...props });

export const useDeleteBranch = (props?: Partial<EntityConfig>) => 
  useDeleteActionBase({ ...branchesConfig, ...props });

// UE hooks
export const useCreateUe = <T extends { id?: string }>(props?: Partial<EntityConfig>) => 
  useCreateActionBase<T>({ ...uesConfig, ...props });

export const useUpdateUe = <T extends { id: string }>(props?: Partial<EntityConfig>) => 
  useUpdateActionBase<T>({ ...uesConfig, ...props });

export const useDeleteUe = (props?: Partial<EntityConfig>) => 
  useDeleteActionBase({ ...uesConfig, ...props });

// Level hooks
export const useCreateLevel = <T extends { id?: string }>(props?: Partial<EntityConfig>) => 
  useCreateActionBase<T>({ ...levelsConfig, ...props });

export const useUpdateLevel = <T extends { id: string }>(props?: Partial<EntityConfig>) => 
  useUpdateActionBase<T>({ ...levelsConfig, ...props });

export const useDeleteLevel = (props?: Partial<EntityConfig>) => 
  useDeleteActionBase({ ...levelsConfig, ...props });

// User hooks
export const useCreateUser = <T extends { id?: string }>(props?: Partial<EntityConfig>) => 
  useCreateActionBase<T>({ ...usersConfig, ...props });

export const useUpdateUser = <T extends { id: string }>(props?: Partial<EntityConfig>) => 
  useUpdateActionBase<T>({ ...usersConfig, ...props });

export const useDeleteUser = (props?: Partial<EntityConfig>) => 
  useDeleteActionBase({ ...usersConfig, ...props });

// Authorization hooks
export const useCreateAuthorization = <T extends { id?: string }>(props?: Partial<EntityConfig>) => 
  useCreateActionBase<T>({ ...authorizationsConfig, ...props });

export const useUpdateAuthorization = <T extends { id: string }>(props?: Partial<EntityConfig>) => 
  useUpdateActionBase<T>({ ...authorizationsConfig, ...props });

export const useDeleteAuthorization = (props?: Partial<EntityConfig>) => 
  useDeleteActionBase({ ...authorizationsConfig, ...props });

// Profile hooks
export const useCreateProfile = <T extends { id?: string }>(props?: Partial<EntityConfig>) => 
  useCreateActionBase<T>({ ...profilesConfig, ...props });

export const useUpdateProfile = <T extends { id: string }>(props?: Partial<EntityConfig>) => 
  useUpdateActionBase<T>({ ...profilesConfig, ...props });

export const useDeleteProfile = (props?: Partial<EntityConfig>) => 
  useDeleteActionBase({ ...profilesConfig, ...props }); 