import { FloatingOverlay } from '@floating-ui/react';
import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { isSmallScreen } from '@/src/utils/app/mobile';

import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { MarketplaceActions } from '@/src/store/marketplace/marketplace.reducers';
import {
  ModelsActions,
  ModelsSelectors,
} from '@/src/store/models/models.reducers';
import { UISelectors } from '@/src/store/ui/ui.reducers';

import {
  MarketplaceQueryParams,
  MarketplaceTabs,
} from '@/src/constants/marketplace';

import { Spinner } from '@/src/components/Common/Spinner';
import { TabRenderer } from '@/src/components/Marketplace/TabRenderer';

const Marketplace = () => {
  const dispatch = useAppDispatch();

  const searchParams = useSearchParams();

  const isFilterbarOpen = useAppSelector(
    UISelectors.selectShowMarketplaceFilterbar,
  );
  const isProfileOpen = useAppSelector(UISelectors.selectIsProfileOpen);
  const isModelsLoading = useAppSelector(ModelsSelectors.selectModelsIsLoading);
  const [isMobile, setIsMobile] = useState(isSmallScreen());

  const showOverlay = (isFilterbarOpen || isProfileOpen) && isSmallScreen();

  useEffect(() => {
    const handleResize = () => setIsMobile(isSmallScreen());
    const resizeObserver = new ResizeObserver(handleResize);

    resizeObserver.observe(document.body);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    dispatch(ModelsActions.getModels());
  }, [dispatch]);
  useEffect(() => {
    dispatch(
      MarketplaceActions.setSelectedTab(
        searchParams.get(MarketplaceQueryParams.fromConversation)
          ? MarketplaceTabs.MY_APPLICATIONS
          : MarketplaceTabs.HOME,
      ),
    );
  }, [dispatch, searchParams]);

  return (
    <div
      className="grow overflow-auto px-6 py-4 xl:px-16"
      data-qa="marketplace"
    >
      {isModelsLoading ? (
        <div className="flex h-full items-center justify-center">
          <Spinner size={60} className="mx-auto" />
        </div>
      ) : (
        <>
          <TabRenderer isMobile={isMobile} />

          {showOverlay && <FloatingOverlay className="z-30 bg-blackout" />}
        </>
      )}
    </div>
  );
};

export default Marketplace;
