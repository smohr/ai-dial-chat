import { PublishingApprovalModalSelectors } from '@/src/ui/selectors';
import { BaseElement } from '@/src/ui/webElements/baseElement';
import {
  ApplicationsToApproveTree,
  ConversationsToApproveTree,
  FilesToApproveTree,
  FolderConversationsToApprove,
  FolderFilesToApprove,
  FolderPromptsToApprove,
  PromptsToApproveTree,
} from '@/src/ui/webElements/entityTree';
import { Page } from '@playwright/test';

export class PublishingApprovalModal extends BaseElement {
  constructor(page: Page) {
    super(page, PublishingApprovalModalSelectors.modalContainer);
  }

  //conversations to approve trees
  private conversationsToApproveTree!: ConversationsToApproveTree;
  private folderConversationsToApprove!: FolderConversationsToApprove;
  //files to approve trees
  private filesToApproveTree!: FilesToApproveTree;
  private folderFilesToApprove!: FolderFilesToApprove;
  //prompts to approve trees
  private promptsToApproveTree!: PromptsToApproveTree;
  private folderPromptsToApprove!: FolderPromptsToApprove;
  //applications to approve tree
  private applicationsToPublishTree!: ApplicationsToApproveTree;

  getConversationsToApproveTree(): ConversationsToApproveTree {
    if (!this.conversationsToApproveTree) {
      this.conversationsToApproveTree = new ConversationsToApproveTree(
        this.page,
        this.rootLocator,
      );
    }
    return this.conversationsToApproveTree;
  }

  getFolderConversationsToApprove(): FolderConversationsToApprove {
    if (!this.folderConversationsToApprove) {
      this.folderConversationsToApprove = new FolderConversationsToApprove(
        this.page,
        this.rootLocator,
      );
    }
    return this.folderConversationsToApprove;
  }

  getFilesToApproveTree(): FilesToApproveTree {
    if (!this.filesToApproveTree) {
      this.filesToApproveTree = new FilesToApproveTree(
        this.page,
        this.rootLocator,
      );
    }
    return this.filesToApproveTree;
  }

  getFolderFilesToApprove(): FolderFilesToApprove {
    if (!this.folderFilesToApprove) {
      this.folderFilesToApprove = new FolderFilesToApprove(
        this.page,
        this.rootLocator,
      );
    }
    return this.folderFilesToApprove;
  }

  getPromptsToApproveTree(): PromptsToApproveTree {
    if (!this.promptsToApproveTree) {
      this.promptsToApproveTree = new PromptsToApproveTree(
        this.page,
        this.rootLocator,
      );
    }
    return this.promptsToApproveTree;
  }

  getFolderPromptsToApprove(): FolderPromptsToApprove {
    if (!this.folderPromptsToApprove) {
      this.folderPromptsToApprove = new FolderPromptsToApprove(
        this.page,
        this.rootLocator,
      );
    }
    return this.folderPromptsToApprove;
  }

  getApplicationsToApproveTree(): ApplicationsToApproveTree {
    if (!this.applicationsToPublishTree) {
      this.applicationsToPublishTree = new ApplicationsToApproveTree(
        this.page,
        this.rootLocator,
      );
    }
    return this.applicationsToPublishTree;
  }

  public publishName = this.getChildElementBySelector(
    PublishingApprovalModalSelectors.publishName,
  );
  public publishToPath = this.getChildElementBySelector(
    PublishingApprovalModalSelectors.publishToPath,
  );
  public publishDate = this.getChildElementBySelector(
    PublishingApprovalModalSelectors.publishDate,
  );
}
