import { useCallback, useMemo, useState } from 'react';

import { groupModelsAndSaveOrder } from '@/src/utils/app/conversation';
import { getFolderIdFromEntityId } from '@/src/utils/app/folders';
import { isSmallScreen } from '@/src/utils/app/mobile';
import { doesEntityContainSearchTerm } from '@/src/utils/app/search';
import { ApiUtils } from '@/src/utils/server/api';

import { ApplicationActionType } from '@/src/types/applications';
import { DialAIEntityModel } from '@/src/types/models';
import { SharingType } from '@/src/types/share';

import { ApplicationActions } from '@/src/store/application/application.reducers';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { MarketplaceSelectors } from '@/src/store/marketplace/marketplace.reducers';
import {
  ModelsActions,
  ModelsSelectors,
} from '@/src/store/models/models.reducers';

import { FilterTypes, MarketplaceTabs } from '@/src/constants/marketplace';

import { PublishModal } from '@/src/components/Chat/Publish/PublishWizard';
import { ApplicationDialog } from '@/src/components/Common/ApplicationDialog';
import { ConfirmDialog } from '@/src/components/Common/ConfirmDialog';
import ApplicationDetails from '@/src/components/Marketplace/ApplicationDetails/ApplicationDetails';
import { CardsList } from '@/src/components/Marketplace/CardsList';
import { MarketplaceBanner } from '@/src/components/Marketplace/MarketplaceBanner';
import { SearchHeader } from '@/src/components/Marketplace/SearchHeader';

import { PublishActions, ShareEntity } from '@epam/ai-dial-shared';
import { orderBy } from 'lodash-es';

enum DeleteType {
  DELETE,
  REMOVE,
}

const deleteConfirmationText = {
  [DeleteType.DELETE]: {
    heading: 'Confirm deleting application',
    description: 'Are you sure you want to delete the application?',
    confirmLabel: 'Delete',
  },
  [DeleteType.REMOVE]: {
    heading: 'Confirm removing application',
    description:
      'Are you sure you want to remove the application from your list?',
    confirmLabel: 'Remove',
  },
};

interface TabRendererProps {
  isMobile?: boolean;
}

export const TabRenderer = ({ isMobile }: TabRendererProps) => {
  const dispatch = useAppDispatch();

  const installedModelIds = useAppSelector(
    ModelsSelectors.selectInstalledModelIds,
  );
  const installedModels = useAppSelector(ModelsSelectors.selectInstalledModels);
  const selectedTab = useAppSelector(MarketplaceSelectors.selectSelectedTab);
  const selectedFilters = useAppSelector(
    MarketplaceSelectors.selectSelectedFilters,
  );
  const searchTerm = useAppSelector(MarketplaceSelectors.selectSearchTerm);
  const allModels = useAppSelector(ModelsSelectors.selectModels);

  const [applicationModel, setApplicationModel] = useState<{
    action: ApplicationActionType;
    entity?: DialAIEntityModel;
  }>();
  const [deleteModel, setDeleteModel] = useState<{
    action: DeleteType;
    entity: DialAIEntityModel;
  }>();
  const [publishModel, setPublishModel] = useState<{
    entity: ShareEntity;
    action: PublishActions;
  }>();
  const [detailsModel, setDetailsModel] = useState<DialAIEntityModel>();

  const displayedEntities = useMemo(() => {
    const filteredEntities = allModels.filter(
      (entity) =>
        (doesEntityContainSearchTerm(entity, searchTerm) ||
          (entity.version &&
            doesEntityContainSearchTerm(
              { name: entity.version },
              searchTerm,
            ))) &&
        (selectedFilters[FilterTypes.ENTITY_TYPE].length
          ? selectedFilters[FilterTypes.ENTITY_TYPE].includes(entity.type)
          : true),
    );

    const entitiesForTab =
      selectedTab === MarketplaceTabs.MY_APPLICATIONS
        ? filteredEntities.filter((entity) => installedModelIds.has(entity.id))
        : filteredEntities;

    const groupedEntities = groupModelsAndSaveOrder(entitiesForTab).slice(
      0,
      Number.MAX_SAFE_INTEGER,
    );

    const orderedEntities = groupedEntities.map(
      ({ entities }) => orderBy(entities, 'version', 'desc')[0],
    );

    return orderedEntities;
  }, [installedModelIds, allModels, searchTerm, selectedFilters, selectedTab]);

  const handleAddApplication = useCallback(() => {
    setApplicationModel({
      action: ApplicationActionType.ADD,
    });
  }, []);

  const handleEditApplication = useCallback(
    (entity: DialAIEntityModel) => {
      dispatch(ApplicationActions.get(entity.id));
      setApplicationModel({
        entity,
        action: ApplicationActionType.EDIT,
      });
    },
    [dispatch],
  );

  const handleDeleteClose = useCallback(
    (confirm: boolean) => {
      if (confirm && deleteModel) {
        if (deleteModel.action === DeleteType.REMOVE) {
          const filteredModels = installedModels.filter(
            (model) => deleteModel.entity.id !== model.id,
          );
          dispatch(ModelsActions.updateInstalledModels(filteredModels));
        }
        if (deleteModel.action === DeleteType.DELETE) {
          dispatch(ApplicationActions.delete(deleteModel.entity));
        }
      }
      setDeleteModel(undefined);
    },
    [deleteModel, installedModels, dispatch],
  );

  const handleSetPublishEntity = useCallback(
    (entity: DialAIEntityModel, action: PublishActions) =>
      setPublishModel({
        entity: {
          name: entity.name,
          id: ApiUtils.decodeApiUrl(entity.id),
          folderId: getFolderIdFromEntityId(entity.id),
        },
        action,
      }),
    [],
  );

  const handlePublishClose = useCallback(() => setPublishModel(undefined), []);

  const handleDelete = useCallback(
    (entity: DialAIEntityModel) => {
      setDeleteModel({ entity, action: DeleteType.DELETE });
    },
    [setDeleteModel],
  );

  const handleRemove = useCallback(
    (entity: DialAIEntityModel) => {
      setDeleteModel({ entity, action: DeleteType.REMOVE });
    },
    [setDeleteModel],
  );

  const handleCardClick = useCallback(
    (entity: DialAIEntityModel) => {
      setDetailsModel(entity);
    },
    [setDetailsModel],
  );

  const handleCloseApplicationDialog = useCallback(
    () => setApplicationModel(undefined),
    [setApplicationModel],
  );

  const handleCloseDetailsDialog = useCallback(
    () => setDetailsModel(undefined),
    [setDetailsModel],
  );

  return (
    <>
      <header className="mb-4" data-qa="marketplace-header">
        <MarketplaceBanner />
        <SearchHeader
          items={displayedEntities.length}
          onAddApplication={handleAddApplication}
        />
      </header>

      <CardsList
        title={
          selectedTab === MarketplaceTabs.HOME ? 'All applications' : undefined
        }
        entities={displayedEntities}
        onCardClick={handleCardClick}
        onPublish={handleSetPublishEntity}
        onDelete={handleDelete}
        onRemove={handleRemove}
        onEdit={handleEditApplication}
        isMobile={isMobile}
      />

      {/* MODALS */}
      {!!applicationModel && (
        <ApplicationDialog
          isOpen={!!applicationModel}
          isEdit={applicationModel.action === ApplicationActionType.EDIT}
          currentReference={applicationModel.entity?.reference}
          onClose={handleCloseApplicationDialog}
        />
      )}
      {!!deleteModel && (
        <ConfirmDialog
          isOpen={!!deleteModel}
          {...deleteConfirmationText[deleteModel.action]}
          onClose={handleDeleteClose}
          cancelLabel="Cancel"
        />
      )}
      {detailsModel && (
        <ApplicationDetails
          onPublish={handleSetPublishEntity}
          isMobileView={isMobile ?? isSmallScreen()}
          entity={detailsModel}
          onClose={handleCloseDetailsDialog}
          onEdit={handleEditApplication}
          allEntities={allModels}
          onlyInstalledVersions={
            selectedTab === MarketplaceTabs.MY_APPLICATIONS
          }
        />
      )}
      {!!(publishModel && publishModel?.entity?.id) && (
        <PublishModal
          entity={publishModel.entity}
          type={SharingType.Application}
          isOpen={!!publishModel}
          onClose={handlePublishClose}
          publishAction={publishModel.action}
        />
      )}
    </>
  );
};
