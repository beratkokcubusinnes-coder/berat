
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  username: 'username',
  name: 'name',
  password: 'password',
  bio: 'bio',
  avatar: 'avatar',
  coverImage: 'coverImage',
  location: 'location',
  role: 'role',
  banned: 'banned',
  banReason: 'banReason',
  warnings: 'warnings',
  sessionVersion: 'sessionVersion',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  expiresAt: 'expiresAt',
  sessionVersion: 'sessionVersion',
  createdAt: 'createdAt'
};

exports.Prisma.FollowScalarFieldEnum = {
  followerId: 'followerId',
  followingId: 'followingId',
  createdAt: 'createdAt'
};

exports.Prisma.ThreadScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  content: 'content',
  prompt: 'prompt',
  mediaUrls: 'mediaUrls',
  category: 'category',
  tags: 'tags',
  authorId: 'authorId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  content: 'content',
  authorId: 'authorId',
  threadId: 'threadId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ThreadLikeScalarFieldEnum = {
  userId: 'userId',
  threadId: 'threadId',
  createdAt: 'createdAt'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  type: 'type',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  canonicalUrl: 'canonicalUrl',
  headline: 'headline',
  seoContent: 'seoContent',
  noIndex: 'noIndex'
};

exports.Prisma.PromptScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  content: 'content',
  description: 'description',
  model: 'model',
  category: 'category',
  categoryId: 'categoryId',
  images: 'images',
  image: 'image',
  views: 'views',
  likes: 'likes',
  authorId: 'authorId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  canonicalUrl: 'canonicalUrl',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  ogImage: 'ogImage',
  tldr: 'tldr',
  noIndex: 'noIndex',
  noFollow: 'noFollow',
  lastUpdated: 'lastUpdated',
  promptCount: 'promptCount',
  promptType: 'promptType',
  authorName: 'authorName',
  authorBio: 'authorBio',
  beforeImage: 'beforeImage',
  afterImage: 'afterImage',
  isFeatured: 'isFeatured',
  status: 'status'
};

exports.Prisma.ScriptScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  content: 'content',
  description: 'description',
  language: 'language',
  image: 'image',
  views: 'views',
  authorId: 'authorId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  canonicalUrl: 'canonicalUrl',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  ogImage: 'ogImage',
  tldr: 'tldr',
  noIndex: 'noIndex',
  noFollow: 'noFollow',
  lastUpdated: 'lastUpdated',
  promptCount: 'promptCount',
  promptType: 'promptType',
  authorName: 'authorName',
  authorBio: 'authorBio',
  categoryId: 'categoryId',
  status: 'status'
};

exports.Prisma.HookScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  content: 'content',
  description: 'description',
  categoryId: 'categoryId',
  image: 'image',
  views: 'views',
  authorId: 'authorId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  canonicalUrl: 'canonicalUrl',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  ogImage: 'ogImage',
  tldr: 'tldr',
  noIndex: 'noIndex',
  noFollow: 'noFollow',
  lastUpdated: 'lastUpdated',
  promptCount: 'promptCount',
  promptType: 'promptType',
  authorName: 'authorName',
  authorBio: 'authorBio',
  status: 'status'
};

exports.Prisma.ToolScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  description: 'description',
  content: 'content',
  icon: 'icon',
  link: 'link',
  image: 'image',
  categoryId: 'categoryId',
  views: 'views',
  authorId: 'authorId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  canonicalUrl: 'canonicalUrl',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  ogImage: 'ogImage',
  tldr: 'tldr',
  noIndex: 'noIndex',
  noFollow: 'noFollow',
  lastUpdated: 'lastUpdated',
  promptCount: 'promptCount',
  promptType: 'promptType',
  authorName: 'authorName',
  authorBio: 'authorBio',
  status: 'status'
};

exports.Prisma.BlogPostScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  content: 'content',
  excerpt: 'excerpt',
  image: 'image',
  categoryId: 'categoryId',
  published: 'published',
  views: 'views',
  authorId: 'authorId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  canonicalUrl: 'canonicalUrl',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  ogImage: 'ogImage',
  tldr: 'tldr',
  noIndex: 'noIndex',
  noFollow: 'noFollow',
  lastUpdated: 'lastUpdated',
  promptCount: 'promptCount',
  promptType: 'promptType',
  authorName: 'authorName',
  authorBio: 'authorBio',
  status: 'status'
};

exports.Prisma.SeoSettingScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  type: 'type',
  group: 'group',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RedirectScalarFieldEnum = {
  id: 'id',
  source: 'source',
  destination: 'destination',
  code: 'code',
  isActive: 'isActive',
  isWildcard: 'isWildcard',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemSettingScalarFieldEnum = {
  id: 'id',
  key: 'key',
  value: 'value',
  type: 'type',
  category: 'category',
  label: 'label',
  description: 'description',
  isPublic: 'isPublic',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FavoriteScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  itemId: 'itemId',
  itemType: 'itemType',
  createdAt: 'createdAt'
};

exports.Prisma.MediaScalarFieldEnum = {
  id: 'id',
  url: 'url',
  filename: 'filename',
  altText: 'altText',
  caption: 'caption',
  description: 'description',
  mimeType: 'mimeType',
  size: 'size',
  width: 'width',
  height: 'height',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PageBlockScalarFieldEnum = {
  id: 'id',
  title: 'title',
  adminLabel: 'adminLabel',
  type: 'type',
  identifier: 'identifier',
  placement: 'placement',
  order: 'order',
  content: 'content',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContentTranslationScalarFieldEnum = {
  id: 'id',
  contentType: 'contentType',
  contentId: 'contentId',
  language: 'language',
  title: 'title',
  description: 'description',
  content: 'content',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  ogTitle: 'ogTitle',
  ogDescription: 'ogDescription',
  seoContent: 'seoContent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StaticPageScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  content: 'content',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  link: 'link',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Session: 'Session',
  Follow: 'Follow',
  Thread: 'Thread',
  Comment: 'Comment',
  ThreadLike: 'ThreadLike',
  Category: 'Category',
  Prompt: 'Prompt',
  Script: 'Script',
  Hook: 'Hook',
  Tool: 'Tool',
  BlogPost: 'BlogPost',
  SeoSetting: 'SeoSetting',
  Redirect: 'Redirect',
  SystemSetting: 'SystemSetting',
  Favorite: 'Favorite',
  Media: 'Media',
  PageBlock: 'PageBlock',
  ContentTranslation: 'ContentTranslation',
  StaticPage: 'StaticPage',
  Notification: 'Notification'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
