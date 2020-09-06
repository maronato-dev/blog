"use strict"

const globalCommento = (window.commento = {})

// Do not use other files like utils.js and http.js in the gulpfile to build
// commento.js for the following reasons:
//   - We don't use jQuery in the actual JavaScript payload because we need
//     to be lightweight.
//   - They pollute the globalCommento/window namespace (with globalCommento.post, etc.).
//     That's NOT fine when we expect them to source our JavaScript. For example,
//     the user may have their own window.post defined. We don't want to
//     override that.

let ID_ROOT = "commento"
let ID_MAIN_AREA = "commento-main-area"
let ID_LOGIN = "commento-login"
let ID_LOGIN_BOX_CONTAINER = "commento-login-box-container"
let ID_LOGIN_BOX = "commento-login-box"
let ID_LOGIN_BOX_EMAIL_SUBTITLE = "commento-login-box-email-subtitle"
let ID_LOGIN_BOX_EMAIL_INPUT = "commento-login-box-email-input"
let ID_LOGIN_BOX_PASSWORD_INPUT = "commento-login-box-password-input"
let ID_LOGIN_BOX_NAME_INPUT = "commento-login-box-name-input"
let ID_LOGIN_BOX_WEBSITE_INPUT = "commento-login-box-website-input"
let ID_LOGIN_BOX_EMAIL_BUTTON = "commento-login-box-email-button"
let ID_LOGIN_BOX_FORGOT_LINK_CONTAINER =
  "commento-login-box-forgot-link-container"
let ID_LOGIN_BOX_LOGIN_LINK_CONTAINER =
  "commento-login-box-login-link-container"
let ID_LOGIN_BOX_SSO_PRETEXT = "commento-login-box-sso-pretext"
let ID_LOGIN_BOX_SSO_BUTTON_CONTAINER =
  "commento-login-box-sso-buttton-container"
let ID_LOGIN_BOX_HR1 = "commento-login-box-hr1"
let ID_LOGIN_BOX_OAUTH_PRETEXT = "commento-login-box-oauth-pretext"
let ID_LOGIN_BOX_OAUTH_BUTTONS_CONTAINER =
  "commento-login-box-oauth-buttons-container"
let ID_LOGIN_BOX_HR2 = "commento-login-box-hr2"
let ID_MOD_TOOLS = "commento-mod-tools"
let ID_MOD_TOOLS_LOCK_BUTTON = "commento-mod-tools-lock-button"
let ID_ERROR = "commento-error"
let ID_LOGGED_CONTAINER = "commento-logged-container"
let ID_PRE_COMMENTS_AREA = "commento-pre-comments-area"
let ID_COMMENTS_AREA = "commento-comments-area"
let ID_SUPER_CONTAINER = "commento-textarea-super-container-"
let ID_TEXTAREA_CONTAINER = "commento-textarea-container-"
let ID_TEXTAREA = "commento-textarea-"
let ID_ANONYMOUS_CHECKBOX = "commento-anonymous-checkbox-"
let ID_SORT_POLICY = "commento-sort-policy-"
let ID_CARD = "commento-comment-card-"
let ID_BODY = "commento-comment-body-"
let ID_TEXT = "commento-comment-text-"
let ID_SUBTITLE = "commento-comment-subtitle-"
let ID_TIMEAGO = "commento-comment-timeago-"
let ID_SCORE = "commento-comment-score-"
let ID_OPTIONS = "commento-comment-options-"
let ID_EDIT = "commento-comment-edit-"
let ID_REPLY = "commento-comment-reply-"
let ID_COLLAPSE = "commento-comment-collapse-"
let ID_UPVOTE = "commento-comment-upvote-"
let ID_DOWNVOTE = "commento-comment-downvote-"
let ID_APPROVE = "commento-comment-approve-"
let ID_REMOVE = "commento-comment-remove-"
let ID_STICKY = "commento-comment-sticky-"
let ID_CHILDREN = "commento-comment-children-"
let ID_CONTENTS = "commento-comment-contents-"
let ID_NAME = "commento-comment-name-"
let ID_SUBMIT_BUTTON = "commento-submit-button-"
let ID_MARKDOWN_BUTTON = "commento-markdown-button-"
let ID_MARKDOWN_HELP = "commento-markdown-help-"
let ID_FOOTER = "commento-footer"

let origin = "[[[.Origin]]]"
let cdn = "[[[.CdnPrefix]]]"
let root = null
let pageId = parent.location.pathname
let hideDeleted
let isAuthenticated = false
let comments = []
let commentsMap = {}
let commenters = {}
let requireIdentification = true
let isModerator = false
let isFrozen = false
let chosenAnonymous = false
let isLocked = false
let stickyCommentHex = "none"
let shownReply = {}
let shownEdit = {}
let configuredOauths = {}
let anonymousOnly = false
let popupBoxType = "login"
let oauthButtonsShown = false
let sortPolicy = "score-desc"
let selfHex = undefined
let mobileView = null

function $(id) {
  return document.getElementById(id)
}

function prepend(root, el) {
  root.prepend(el)
}

function append(root, el) {
  root.appendChild(el)
}

function insertAfter(el1, el2) {
  el1.parentNode.insertBefore(el2, el1.nextSibling)
}

function classAdd(el, cls) {
  el.classList.add("commento-" + cls)
}

function classRemove(el, cls) {
  if (el !== null) {
    el.classList.remove("commento-" + cls)
  }
}

function create(el) {
  return document.createElement(el)
}

function remove(el) {
  if (el !== null) {
    el.parentNode.removeChild(el)
  }
}

function removeAllEventListeners(node) {
  if (node !== null) {
    let replacement = node.cloneNode(true)
    if (node.parentNode !== null) {
      node.parentNode.replaceChild(replacement, node)
      return replacement
    }
  }

  return node
}

function onclick(node, f, arg) {
  node.addEventListener(
    "click",
    function () {
      f(arg)
    },
    false
  )
}

function attrSet(node, a, value) {
  node.setAttribute(a, value)
}

function post(url, data, callback) {
  let xmlDoc = new XMLHttpRequest()

  xmlDoc.open("POST", url, true)
  xmlDoc.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
  xmlDoc.onload = function () {
    callback(JSON.parse(xmlDoc.response))
  }

  xmlDoc.send(JSON.stringify(data))
}

function get(url, callback) {
  let xmlDoc = new XMLHttpRequest()

  xmlDoc.open("GET", url, true)
  xmlDoc.onload = function () {
    callback(JSON.parse(xmlDoc.response))
  }

  xmlDoc.send(null)
}

function call(callback) {
  if (typeof callback === "function") {
    callback()
  }
}

function cookieGet(name) {
  let c = "; " + document.cookie
  let x = c.split("; " + name + "=")
  if (x.length === 2) {
    return x.pop().split(";").shift()
  }
}

function cookieSet(name, value) {
  let expires = ""
  let date = new Date()
  date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000)
  expires = "; expires=" + date.toUTCString()

  document.cookie = name + "=" + value + expires + "; path=/"
}

function commenterTokenGet() {
  let commenterToken = cookieGet("commentoCommenterToken")
  if (commenterToken === undefined) {
    return "anonymous"
  }

  return commenterToken
}

globalCommento.logout = function () {
  cookieSet("commentoCommenterToken", "anonymous")
  isAuthenticated = false
  isModerator = false
  selfHex = undefined
  refreshAll()
}

function profileEdit() {
  window.open(
    origin + "/profile?commenterToken=" + commenterTokenGet(),
    "_blank"
  )
}

function notificationSettings(unsubscribeSecretHex) {
  window.open(
    origin + "/unsubscribe?unsubscribeSecretHex=" + unsubscribeSecretHex,
    "_blank"
  )
}

function selfLoad(commenter, email) {
  commenters[commenter.commenterHex] = commenter
  selfHex = commenter.commenterHex

  let loggedContainer = create("div")
  let loggedInAs = create("div")
  let name
  if (commenter.link !== "undefined") {
    name = create("a")
  } else {
    name = create("div")
  }
  let avatar
  let notificationSettingsButton = create("div")
  let profileEditButton = create("div")
  let logoutButton = create("div")
  let color = colorGet(commenter.commenterHex + "-" + commenter.name)

  loggedContainer.id = ID_LOGGED_CONTAINER

  classAdd(loggedContainer, "logged-container")
  classAdd(loggedInAs, "logged-in-as")
  classAdd(name, "name")
  classAdd(notificationSettingsButton, "profile-button")
  classAdd(profileEditButton, "profile-button")
  classAdd(logoutButton, "profile-button")

  name.innerText = commenter.name
  notificationSettingsButton.innerText = "Notification Settings"
  profileEditButton.innerText = "Edit Profile"
  logoutButton.innerText = "Logout"

  onclick(logoutButton, globalCommento.logout)
  onclick(
    notificationSettingsButton,
    notificationSettings,
    email.unsubscribeSecretHex
  )
  onclick(profileEditButton, profileEdit)

  attrSet(loggedContainer, "style", "display: none")
  if (commenter.link !== "undefined") {
    attrSet(name, "href", commenter.link)
  }
  if (commenter.photo === "undefined") {
    avatar = create("div")
    avatar.style["background"] = color
    avatar.innerHTML = commenter.name[0].toUpperCase()
    classAdd(avatar, "avatar")
  } else {
    avatar = create("img")
    attrSet(
      avatar,
      "src",
      cdn + "/api/commenter/photo?commenterHex=" + commenter.commenterHex
    )
    attrSet(avatar, "loading", "lazy")
    classAdd(avatar, "avatar-img")
  }

  append(loggedInAs, avatar)
  append(loggedInAs, name)
  append(loggedContainer, loggedInAs)
  append(loggedContainer, logoutButton)
  if (commenter.provider === "commento") {
    append(loggedContainer, profileEditButton)
  }
  append(loggedContainer, notificationSettingsButton)
  prepend(root, loggedContainer)

  isAuthenticated = true
}

function selfGet(callback) {
  let commenterToken = commenterTokenGet()
  if (commenterToken === "anonymous") {
    isAuthenticated = false
    call(callback)
    return
  }

  let json = {
    commenterToken: commenterTokenGet(),
  }

  post(origin + "/api/commenter/self", json, function (resp) {
    if (!resp.success) {
      cookieSet("commentoCommenterToken", "anonymous")
      call(callback)
      return
    }

    selfLoad(resp.commenter, resp.email)
    allShow()

    call(callback)
  })
}

function footerLoad() {
  let footer = create("div")
  let aContainer = create("div")
  let a = create("a")
  let text = create("span")

  footer.id = ID_FOOTER

  classAdd(footer, "footer")
  classAdd(aContainer, "logo-container")
  classAdd(a, "logo")
  classAdd(text, "logo-text")

  attrSet(a, "href", "https://commento.io")
  attrSet(a, "target", "_blank")

  text.innerText = "Commento"

  append(a, text)
  append(aContainer, a)
  append(footer, aContainer)

  return footer
}

function commentsGet(callback) {
  let json = {
    commenterToken: commenterTokenGet(),
    domain: parent.location.host,
    path: pageId,
  }

  post(origin + "/api/comment/list", json, function (resp) {
    if (!resp.success) {
      errorShow(resp.message)
      return
    } else {
      errorHide()
    }

    requireIdentification = resp.requireIdentification
    isModerator = resp.isModerator
    isFrozen = resp.isFrozen

    isLocked = resp.attributes.isLocked
    stickyCommentHex = resp.attributes.stickyCommentHex

    comments = resp.comments
    commenters = Object.assign({}, commenters, resp.commenters)
    configuredOauths = resp.configuredOauths

    sortPolicy = resp.defaultSortPolicy

    call(callback)
  })
}

function errorShow(text) {
  let el = $(ID_ERROR)

  el.innerText = text

  attrSet(el, "style", "display: block;")
}

function errorHide() {
  let el = $(ID_ERROR)

  attrSet(el, "style", "display: none;")
}

function errorElementCreate() {
  let el = create("div")

  el.id = ID_ERROR

  classAdd(el, "error-box")
  attrSet(el, "style", "display: none;")

  append(root, el)
}

function autoExpander(el) {
  return function () {
    el.style.height = ""
    el.style.height = Math.min(Math.max(el.scrollHeight, 75), 400) + "px"
  }
}

function markdownHelpShow(id) {
  let textareaSuperContainer = $(ID_SUPER_CONTAINER + id)
  let markdownButton = $(ID_MARKDOWN_BUTTON + id)
  let markdownHelp = create("table")
  let italicsContainer = create("tr")
  let italicsLeft = create("td")
  let italicsRight = create("td")
  let boldContainer = create("tr")
  let boldLeft = create("td")
  let boldRight = create("td")
  let codeContainer = create("tr")
  let codeLeft = create("td")
  let codeRight = create("td")
  let strikethroughContainer = create("tr")
  let strikethroughLeft = create("td")
  let strikethroughRight = create("td")
  let hyperlinkContainer = create("tr")
  let hyperlinkLeft = create("td")
  let hyperlinkRight = create("td")
  let quoteContainer = create("tr")
  let quoteLeft = create("td")
  let quoteRight = create("td")

  markdownHelp.id = ID_MARKDOWN_HELP + id

  classAdd(markdownHelp, "markdown-help")

  boldLeft.innerHTML = "<b>bold</b>"
  boldRight.innerHTML = "surround text with <pre>**two asterisks**</pre>"
  italicsLeft.innerHTML = "<i>italics</i>"
  italicsRight.innerHTML = "surround text with <pre>*asterisks*</pre>"
  codeLeft.innerHTML = "<pre>code</pre>"
  codeRight.innerHTML = "surround text with <pre>`backticks`</pre>"
  strikethroughLeft.innerHTML = "<strike>strikethrough</strike>"
  strikethroughRight.innerHTML =
    "surround text with <pre>~~two tilde characters~~</pre>"
  hyperlinkLeft.innerHTML = '<a href="https://example.com">hyperlink</a>'
  hyperlinkRight.innerHTML =
    "<pre>[hyperlink](https://example.com)</pre> or just a bare URL"
  quoteLeft.innerHTML = "<blockquote>quote</blockquote>"
  quoteRight.innerHTML = "prefix with <pre>&gt;</pre>"

  markdownButton = removeAllEventListeners(markdownButton)
  onclick(markdownButton, markdownHelpHide, id)

  append(italicsContainer, italicsLeft)
  append(italicsContainer, italicsRight)
  append(markdownHelp, italicsContainer)
  append(boldContainer, boldLeft)
  append(boldContainer, boldRight)
  append(markdownHelp, boldContainer)
  append(hyperlinkContainer, hyperlinkLeft)
  append(hyperlinkContainer, hyperlinkRight)
  append(markdownHelp, hyperlinkContainer)
  append(codeContainer, codeLeft)
  append(codeContainer, codeRight)
  append(markdownHelp, codeContainer)
  append(strikethroughContainer, strikethroughLeft)
  append(strikethroughContainer, strikethroughRight)
  append(markdownHelp, strikethroughContainer)
  append(quoteContainer, quoteLeft)
  append(quoteContainer, quoteRight)
  append(markdownHelp, quoteContainer)
  append(textareaSuperContainer, markdownHelp)
}

function markdownHelpHide(id) {
  let markdownButton = $(ID_MARKDOWN_BUTTON + id)
  let markdownHelp = $(ID_MARKDOWN_HELP + id)

  markdownButton = removeAllEventListeners(markdownButton)
  onclick(markdownButton, markdownHelpShow, id)

  remove(markdownHelp)
}

function textareaCreate(id, edit) {
  let textareaSuperContainer = create("div")
  let textareaContainer = create("div")
  let textarea = create("textarea")
  let anonymousCheckboxContainer = create("div")
  let anonymousCheckbox = create("input")
  let anonymousCheckboxLabel = create("label")
  let submitButton = create("button")
  let markdownButton = create("a")

  textareaSuperContainer.id = ID_SUPER_CONTAINER + id
  textareaContainer.id = ID_TEXTAREA_CONTAINER + id
  textarea.id = ID_TEXTAREA + id
  anonymousCheckbox.id = ID_ANONYMOUS_CHECKBOX + id
  submitButton.id = ID_SUBMIT_BUTTON + id
  markdownButton.id = ID_MARKDOWN_BUTTON + id

  classAdd(textareaContainer, "textarea-container")
  classAdd(anonymousCheckboxContainer, "round-check")
  classAdd(anonymousCheckboxContainer, "anonymous-checkbox-container")
  classAdd(submitButton, "button")
  classAdd(submitButton, "submit-button")
  classAdd(markdownButton, "markdown-button")
  classAdd(textareaSuperContainer, "button-margin")

  attrSet(textarea, "placeholder", "Add a comment")
  attrSet(anonymousCheckbox, "type", "checkbox")
  attrSet(anonymousCheckboxLabel, "for", ID_ANONYMOUS_CHECKBOX + id)

  anonymousCheckboxLabel.innerText = "Comment anonymously"
  if (edit === true) {
    submitButton.innerText = "Save Changes"
  } else {
    submitButton.innerText = "Add Comment"
  }
  markdownButton.innerHTML = "<b>M &#8595;</b> &nbsp; Markdown"

  if (anonymousOnly) {
    anonymousCheckbox.checked = true
    anonymousCheckbox.setAttribute("disabled", true)
  }

  textarea.oninput = autoExpander(textarea)
  if (edit === true) {
    onclick(submitButton, commentEdit, id)
  } else {
    onclick(submitButton, submitAccountDecide, id)
  }
  onclick(markdownButton, markdownHelpShow, id)

  append(textareaContainer, textarea)
  append(textareaSuperContainer, textareaContainer)
  append(anonymousCheckboxContainer, anonymousCheckbox)
  append(anonymousCheckboxContainer, anonymousCheckboxLabel)
  append(textareaSuperContainer, submitButton)
  if (!requireIdentification && edit !== true) {
    append(textareaSuperContainer, anonymousCheckboxContainer)
  }
  append(textareaSuperContainer, markdownButton)

  return textareaSuperContainer
}

let sortPolicyNames = {
  "score-desc": "Upvotes",
  "creationdate-desc": "Newest",
  "creationdate-asc": "Oldest",
}

function sortPolicyApply(policy) {
  classRemove($(ID_SORT_POLICY + sortPolicy), "sort-policy-button-selected")

  let commentsArea = $(ID_COMMENTS_AREA)
  commentsArea.innerHTML = ""
  sortPolicy = policy
  let cards = commentsRecurse(parentMap(comments), "root")
  if (cards) {
    append(commentsArea, cards)
  }

  classAdd($(ID_SORT_POLICY + policy), "sort-policy-button-selected")
}

function sortPolicyBox() {
  let sortPolicyButtonsContainer = create("div")
  let sortPolicyButtons = create("div")

  classAdd(sortPolicyButtonsContainer, "sort-policy-buttons-container")
  classAdd(sortPolicyButtons, "sort-policy-buttons")

  for (let sp in sortPolicyNames) {
    let sortPolicyButton = create("a")
    sortPolicyButton.id = ID_SORT_POLICY + sp
    classAdd(sortPolicyButton, "sort-policy-button")
    if (sp === sortPolicy) {
      classAdd(sortPolicyButton, "sort-policy-button-selected")
    }
    sortPolicyButton.innerText = sortPolicyNames[sp]
    onclick(sortPolicyButton, sortPolicyApply, sp)
    append(sortPolicyButtons, sortPolicyButton)
  }

  append(sortPolicyButtonsContainer, sortPolicyButtons)

  return sortPolicyButtonsContainer
}

function rootCreate(callback) {
  let login = create("div")
  let loginText = create("div")
  let mainArea = $(ID_MAIN_AREA)
  let preCommentsArea = create("div")
  let commentsArea = create("div")

  login.id = ID_LOGIN
  preCommentsArea.id = ID_PRE_COMMENTS_AREA
  commentsArea.id = ID_COMMENTS_AREA

  classAdd(login, "login")
  classAdd(loginText, "login-text")
  classAdd(commentsArea, "comments")

  loginText.innerText = "Login"
  commentsArea.innerHTML = ""

  onclick(loginText, globalCommento.loginBoxShow, null)

  let numOauthConfigured = 0
  Object.keys(configuredOauths).forEach(function (key) {
    if (configuredOauths[key]) {
      numOauthConfigured++
    }
  })
  if (numOauthConfigured > 0) {
    append(login, loginText)
  } else if (!requireIdentification) {
    anonymousOnly = true
  }

  if (isLocked || isFrozen) {
    if (isAuthenticated || chosenAnonymous) {
      append(
        mainArea,
        messageCreate("This thread is locked. You cannot add new comments.")
      )
      remove($(ID_LOGIN))
    } else {
      append(mainArea, login)
      append(mainArea, textareaCreate("root"))
    }
  } else {
    if (!isAuthenticated) {
      append(mainArea, login)
    } else {
      remove($(ID_LOGIN))
    }
    append(mainArea, textareaCreate("root"))
  }

  if (comments.length > 0) {
    append(mainArea, sortPolicyBox())
  }

  append(mainArea, preCommentsArea)

  append(mainArea, commentsArea)
  append(root, mainArea)

  call(callback)
}

function messageCreate(text) {
  let msg = create("div")

  classAdd(msg, "moderation-notice")

  msg.innerText = text

  return msg
}

globalCommento.commentNew = function (id, commenterToken, callback) {
  let textareaSuperContainer = $(ID_SUPER_CONTAINER + id)
  let textarea = $(ID_TEXTAREA + id)
  let replyButton = $(ID_REPLY + id)

  let markdown = textarea.value

  if (markdown === "") {
    classAdd(textarea, "red-border")
    return
  } else {
    classRemove(textarea, "red-border")
  }

  let json = {
    commenterToken: commenterToken,
    domain: parent.location.host,
    path: pageId,
    parentHex: id,
    markdown: markdown,
  }

  post(origin + "/api/comment/new", json, function (resp) {
    if (!resp.success) {
      errorShow(resp.message)
      return
    } else {
      errorHide()
    }

    let message = ""
    if (resp.state === "unapproved") {
      message = "Your comment is under moderation."
    } else if (resp.state === "flagged") {
      message = "Your comment was flagged as spam and is under moderation."
    }

    if (message !== "") {
      prepend($(ID_SUPER_CONTAINER + id), messageCreate(message))
    }

    let commenterHex = selfHex
    if (commenterHex === undefined || commenterToken === "anonymous") {
      commenterHex = "anonymous"
    }

    let comment = {
      commentHex: resp.commentHex,
      commenterHex: commenterHex,
      markdown: markdown,
      html: resp.html,
      parentHex: "root",
      score: 0,
      state: "approved",
      direction: 0,
      creationDate: new Date(),
    }

    let newCard = commentsRecurse(
      {
        root: [comment],
      },
      "root"
    )

    commentsMap[resp.commentHex] = comment

    if (id !== "root") {
      textareaSuperContainer.replaceWith(newCard)

      shownReply[id] = false

      classAdd(replyButton, "option-reply")
      classRemove(replyButton, "option-cancel")

      replyButton.title = "Reply to this comment"

      onclick(replyButton, globalCommento.replyShow, id)
    } else {
      textarea.value = ""
      insertAfter($(ID_PRE_COMMENTS_AREA), newCard)
    }

    call(callback)
  })
}

function colorGet(name) {
  let colors = [
    "#396ab1",
    "#da7c30",
    "#3e9651",
    "#cc2529",
    "#922428",
    "#6b4c9a",
    "#535154",
  ]

  let total = 0
  for (let i = 0; i < name.length; i++) {
    total += name.charCodeAt(i)
  }
  let color = colors[total % colors.length]

  return color
}

function timeDifference(current, previous) {
  // thanks stackoverflow
  // Times are defined in milliseconds
  let msPerSecond = 1000
  let msPerMinute = 60 * msPerSecond
  let msPerHour = 60 * msPerMinute
  let msPerDay = 24 * msPerHour
  let msPerMonth = 30 * msPerDay
  let msPerYear = 12 * msPerMonth

  // Time ago thresholds
  let msJustNow = 5 * msPerSecond // Up until 5 s
  let msMinutesAgo = 2 * msPerMinute // Up until 2 minutes
  let msHoursAgo = 2 * msPerHour // Up until 2 hours
  let msDaysAgo = 2 * msPerDay // Up until 2 days
  let msMonthsAgo = 2 * msPerMonth // Up until 2 months
  let msYearsAgo = 2 * msPerYear // Up until 2 years

  let elapsed = current - previous

  if (elapsed < msJustNow) {
    return "just now"
  } else if (elapsed < msMinutesAgo) {
    return Math.round(elapsed / msPerSecond) + " seconds ago"
  } else if (elapsed < msHoursAgo) {
    return Math.round(elapsed / msPerMinute) + " minutes ago"
  } else if (elapsed < msDaysAgo) {
    return Math.round(elapsed / msPerHour) + " hours ago"
  } else if (elapsed < msMonthsAgo) {
    return Math.round(elapsed / msPerDay) + " days ago"
  } else if (elapsed < msYearsAgo) {
    return Math.round(elapsed / msPerMonth) + " months ago"
  } else {
    return Math.round(elapsed / msPerYear) + " years ago"
  }
}

function scorify(score) {
  if (score !== 1) {
    return score + " points"
  } else {
    return score + " point"
  }
}

let sortPolicyFunctions = {
  "score-desc": function (a, b) {
    return b.score - a.score
  },
  "creationdate-desc": function (a, b) {
    if (a.creationDate < b.creationDate) {
      return 1
    } else {
      return -1
    }
  },
  "creationdate-asc": function (a, b) {
    if (a.creationDate < b.creationDate) {
      return -1
    } else {
      return 1
    }
  },
}

function commentsRecurse(parentMap, parentHex) {
  let cur = parentMap[parentHex]
  if (!cur || !cur.length) {
    return null
  }

  cur.sort(function (a, b) {
    if (!a.deleted && a.commentHex === stickyCommentHex) {
      return -Infinity
    } else if (!b.deleted && b.commentHex === stickyCommentHex) {
      return Infinity
    }

    return sortPolicyFunctions[sortPolicy](a, b)
  })

  let curTime = new Date().getTime()
  let cards = create("div")
  cur.forEach(function (comment) {
    let commenter = commenters[comment.commenterHex]
    let avatar
    let card = create("div")
    let header = create("div")
    let subtitle = create("div")
    let timeago = create("div")
    let score = create("div")
    let body = create("div")
    let text = create("div")
    let options = create("div")
    let edit = create("button")
    let reply = create("button")
    let collapse = create("button")
    let upvote = create("button")
    let downvote = create("button")
    let approve = create("button")
    let remove = create("button")
    let sticky = create("button")
    let children = commentsRecurse(parentMap, comment.commentHex)
    let contents = create("div")
    let color = colorGet(comment.commenterHex + "-" + commenter.name)
    let name
    if (
      commenter.link !== "undefined" &&
      commenter.link !== "https://undefined" &&
      commenter.link !== ""
    ) {
      name = create("a")
    } else {
      name = create("div")
    }

    card.id = ID_CARD + comment.commentHex
    body.id = ID_BODY + comment.commentHex
    text.id = ID_TEXT + comment.commentHex
    subtitle.id = ID_SUBTITLE + comment.commentHex
    timeago.id = ID_TIMEAGO + comment.commentHex
    score.id = ID_SCORE + comment.commentHex
    options.id = ID_OPTIONS + comment.commentHex
    edit.id = ID_EDIT + comment.commentHex
    reply.id = ID_REPLY + comment.commentHex
    collapse.id = ID_COLLAPSE + comment.commentHex
    upvote.id = ID_UPVOTE + comment.commentHex
    downvote.id = ID_DOWNVOTE + comment.commentHex
    approve.id = ID_APPROVE + comment.commentHex
    remove.id = ID_REMOVE + comment.commentHex
    sticky.id = ID_STICKY + comment.commentHex
    if (children) {
      children.id = ID_CHILDREN + comment.commentHex
    }
    contents.id = ID_CONTENTS + comment.commentHex
    name.id = ID_NAME + comment.commentHex

    collapse.title = "Collapse children"
    upvote.title = "Upvote"
    downvote.title = "Downvote"
    edit.title = "Edit"
    reply.title = "Reply"
    approve.title = "Approve"
    remove.title = "Remove"
    if (stickyCommentHex === comment.commentHex) {
      if (isModerator) {
        sticky.title = "Unsticky"
      } else {
        sticky.title = "This comment has been stickied"
      }
    } else {
      sticky.title = "Sticky"
    }
    timeago.title = comment.creationDate.toString()

    card.style["borderLeft"] = "2px solid " + color
    if (comment.deleted) {
      name.innerText = "[deleted]"
    } else {
      name.innerText = commenter.name
    }
    text.innerHTML = comment.html
    timeago.innerHTML = timeDifference(curTime, comment.creationDate)
    score.innerText = scorify(comment.score)

    if (commenter.photo === "undefined") {
      avatar = create("div")
      avatar.style["background"] = color

      if (comment.commenterHex === "anonymous") {
        avatar.innerHTML = "?"
        avatar.style["font-weight"] = "bold"
      } else {
        avatar.innerHTML = commenter.name[0].toUpperCase()
      }

      classAdd(avatar, "avatar")
    } else {
      avatar = create("img")
      attrSet(
        avatar,
        "src",
        cdn + "/api/commenter/photo?commenterHex=" + commenter.commenterHex
      )
      classAdd(avatar, "avatar-img")
    }

    classAdd(card, "card")
    if (isModerator && comment.state !== "approved") {
      classAdd(card, "dark-card")
    }
    if (commenter.isModerator) {
      classAdd(name, "moderator")
    }
    if (comment.state === "flagged") {
      classAdd(name, "flagged")
    }
    classAdd(header, "header")
    classAdd(name, "name")
    classAdd(subtitle, "subtitle")
    classAdd(timeago, "timeago")
    classAdd(score, "score")
    classAdd(body, "body")
    classAdd(options, "options")
    if (mobileView) {
      classAdd(options, "options-mobile")
    }
    classAdd(edit, "option-button")
    classAdd(edit, "option-edit")
    classAdd(reply, "option-button")
    classAdd(reply, "option-reply")
    classAdd(collapse, "option-button")
    classAdd(collapse, "option-collapse")
    classAdd(upvote, "option-button")
    classAdd(upvote, "option-upvote")
    classAdd(downvote, "option-button")
    classAdd(downvote, "option-downvote")
    classAdd(approve, "option-button")
    classAdd(approve, "option-approve")
    classAdd(remove, "option-button")
    classAdd(remove, "option-remove")
    classAdd(sticky, "option-button")
    if (stickyCommentHex === comment.commentHex) {
      classAdd(sticky, "option-unsticky")
    } else {
      classAdd(sticky, "option-sticky")
    }

    if (isAuthenticated) {
      if (comment.direction > 0) {
        classAdd(upvote, "upvoted")
      } else if (comment.direction < 0) {
        classAdd(downvote, "downvoted")
      }
    }

    onclick(edit, globalCommento.editShow, comment.commentHex)
    onclick(collapse, globalCommento.commentCollapse, comment.commentHex)
    onclick(approve, globalCommento.commentApprove, comment.commentHex)
    onclick(remove, globalCommento.commentDelete, comment.commentHex)
    onclick(sticky, globalCommento.commentSticky, comment.commentHex)

    if (isAuthenticated) {
      let upDown = upDownOnclickSet(
        upvote,
        downvote,
        comment.commentHex,
        comment.direction
      )
      upvote = upDown[0]
      downvote = upDown[1]
    } else {
      onclick(upvote, globalCommento.loginBoxShow, null)
      onclick(downvote, globalCommento.loginBoxShow, null)
    }

    onclick(reply, globalCommento.replyShow, comment.commentHex)

    if (
      commenter.link !== "undefined" &&
      commenter.link !== "https://undefined" &&
      commenter.link !== ""
    ) {
      attrSet(name, "href", commenter.link)
    }

    append(options, collapse)

    if (!comment.deleted) {
      append(options, downvote)
      append(options, upvote)
    }

    if (comment.commenterHex === selfHex) {
      append(options, edit)
    } else if (!comment.deleted) {
      append(options, reply)
    }

    if (!comment.deleted && isModerator && parentHex === "root") {
      append(options, sticky)
    }

    if (!comment.deleted && (isModerator || comment.commenterHex === selfHex)) {
      append(options, remove)
    }

    if (isModerator && comment.state !== "approved") {
      append(options, approve)
    }

    if (
      !comment.deleted &&
      !isModerator &&
      stickyCommentHex === comment.commentHex
    ) {
      append(options, sticky)
    }

    attrSet(
      options,
      "style",
      "width: " + (options.childNodes.length + 1) * 32 + "px;"
    )
    for (let i = 0; i < options.childNodes.length; i++) {
      attrSet(options.childNodes[i], "style", "right: " + i * 32 + "px;")
    }

    append(subtitle, score)
    append(subtitle, timeago)

    if (!mobileView) {
      append(header, options)
    }
    append(header, avatar)
    append(header, name)
    append(header, subtitle)
    append(body, text)
    append(contents, body)
    if (mobileView) {
      append(contents, options)
      let optionsClearfix = create("div")
      classAdd(optionsClearfix, "options-clearfix")
      append(contents, optionsClearfix)
    }

    if (children) {
      classAdd(children, "body")
      append(contents, children)
    }

    append(card, header)
    append(card, contents)

    if (comment.deleted && (hideDeleted === "true" || children === null)) {
      return
    }

    append(cards, card)
  })

  if (cards.childNodes.length === 0) {
    return null
  }

  return cards
}

globalCommento.commentApprove = function (commentHex) {
  let json = {
    commenterToken: commenterTokenGet(),
    commentHex: commentHex,
  }

  post(origin + "/api/comment/approve", json, function (resp) {
    if (!resp.success) {
      errorShow(resp.message)
      return
    } else {
      errorHide()
    }

    let card = $(ID_CARD + commentHex)
    let name = $(ID_NAME + commentHex)
    let tick = $(ID_APPROVE + commentHex)

    classRemove(card, "dark-card")
    classRemove(name, "flagged")
    remove(tick)
  })
}

globalCommento.commentDelete = function (commentHex) {
  if (!confirm("Are you sure you want to delete this comment?")) {
    return
  }

  let json = {
    commenterToken: commenterTokenGet(),
    commentHex: commentHex,
  }

  post(origin + "/api/comment/delete", json, function (resp) {
    if (!resp.success) {
      errorShow(resp.message)
      return
    } else {
      errorHide()
    }

    let text = $(ID_TEXT + commentHex)
    text.innerText = "[deleted]"
  })
}

function nameWidthFix() {
  let els = document.getElementsByClassName("commento-name")

  for (let i = 0; i < els.length; i++) {
    attrSet(
      els[i],
      "style",
      "max-width: " + (els[i].getBoundingClientRect()["width"] + 20) + "px;"
    )
  }
}

function upDownOnclickSet(upvote, downvote, commentHex, direction) {
  upvote = removeAllEventListeners(upvote)
  downvote = removeAllEventListeners(downvote)

  if (direction > 0) {
    onclick(upvote, globalCommento.vote, [commentHex, [1, 0]])
    onclick(downvote, globalCommento.vote, [commentHex, [1, -1]])
  } else if (direction < 0) {
    onclick(upvote, globalCommento.vote, [commentHex, [-1, 1]])
    onclick(downvote, globalCommento.vote, [commentHex, [-1, 0]])
  } else {
    onclick(upvote, globalCommento.vote, [commentHex, [0, 1]])
    onclick(downvote, globalCommento.vote, [commentHex, [0, -1]])
  }

  return [upvote, downvote]
}

globalCommento.vote = function (data) {
  let commentHex = data[0]
  let oldDirection = data[1][0]
  let newDirection = data[1][1]

  let upvote = $(ID_UPVOTE + commentHex)
  let downvote = $(ID_DOWNVOTE + commentHex)
  let score = $(ID_SCORE + commentHex)

  let json = {
    commenterToken: commenterTokenGet(),
    commentHex: commentHex,
    direction: newDirection,
  }

  let upDown = upDownOnclickSet(upvote, downvote, commentHex, newDirection)
  upvote = upDown[0]
  downvote = upDown[1]

  classRemove(upvote, "upvoted")
  classRemove(downvote, "downvoted")
  if (newDirection > 0) {
    classAdd(upvote, "upvoted")
  } else if (newDirection < 0) {
    classAdd(downvote, "downvoted")
  }

  score.innerText = scorify(
    parseInt(score.innerText.replace(/[^\d-.]/g, "")) +
      newDirection -
      oldDirection
  )

  post(origin + "/api/comment/vote", json, function (resp) {
    if (!resp.success) {
      errorShow(resp.message)
      classRemove(upvote, "upvoted")
      classRemove(downvote, "downvoted")
      score.innerText = scorify(
        parseInt(score.innerText.replace(/[^\d-.]/g, "")) -
          newDirection +
          oldDirection
      )
      upDownOnclickSet(upvote, downvote, commentHex, oldDirection)
      return
    } else {
      errorHide()
    }
  })
}

function commentEdit(id) {
  let textarea = $(ID_TEXTAREA + id)

  let markdown = textarea.value

  if (markdown === "") {
    classAdd(textarea, "red-border")
    return
  } else {
    classRemove(textarea, "red-border")
  }

  let json = {
    commenterToken: commenterTokenGet(),
    commentHex: id,
    markdown: markdown,
  }

  post(origin + "/api/comment/edit", json, function (resp) {
    if (!resp.success) {
      errorShow(resp.message)
      return
    } else {
      errorHide()
    }

    commentsMap[id].markdown = markdown
    commentsMap[id].html = resp.html

    let editButton = $(ID_EDIT + id)
    let textarea = $(ID_SUPER_CONTAINER + id)

    textarea.innerHTML = commentsMap[id].html
    textarea.id = ID_TEXT + id
    delete shownEdit[id]

    classAdd(editButton, "option-edit")
    classRemove(editButton, "option-cancel")

    editButton.title = "Edit comment"

    editButton = removeAllEventListeners(editButton)
    onclick(editButton, globalCommento.editShow, id)

    let message = ""
    if (resp.state === "unapproved") {
      message = "Your comment is under moderation."
    } else if (resp.state === "flagged") {
      message = "Your comment was flagged as spam and is under moderation."
    }

    if (message !== "") {
      prepend($(ID_SUPER_CONTAINER + id), messageCreate(message))
    }
  })
}

globalCommento.editShow = function (id) {
  if (id in shownEdit && shownEdit[id]) {
    return
  }

  let text = $(ID_TEXT + id)
  shownEdit[id] = true
  text.replaceWith(textareaCreate(id, true))

  let textarea = $(ID_TEXTAREA + id)
  textarea.value = commentsMap[id].markdown

  let editButton = $(ID_EDIT + id)

  classRemove(editButton, "option-edit")
  classAdd(editButton, "option-cancel")

  editButton.title = "Cancel edit"

  editButton = removeAllEventListeners(editButton)
  onclick(editButton, globalCommento.editCollapse, id)
}

globalCommento.editCollapse = function (id) {
  let editButton = $(ID_EDIT + id)
  let textarea = $(ID_SUPER_CONTAINER + id)

  textarea.innerHTML = commentsMap[id].html
  textarea.id = ID_TEXT + id
  delete shownEdit[id]

  classAdd(editButton, "option-edit")
  classRemove(editButton, "option-cancel")

  editButton.title = "Edit comment"

  editButton = removeAllEventListeners(editButton)
  onclick(editButton, globalCommento.editShow, id)
}

globalCommento.replyShow = function (id) {
  if (id in shownReply && shownReply[id]) {
    return
  }

  let text = $(ID_TEXT + id)
  insertAfter(text, textareaCreate(id))
  shownReply[id] = true

  let replyButton = $(ID_REPLY + id)

  classRemove(replyButton, "option-reply")
  classAdd(replyButton, "option-cancel")

  replyButton.title = "Cancel reply"

  replyButton = removeAllEventListeners(replyButton)
  onclick(replyButton, globalCommento.replyCollapse, id)
}

globalCommento.replyCollapse = function (id) {
  let replyButton = $(ID_REPLY + id)
  let el = $(ID_SUPER_CONTAINER + id)

  el.remove()
  delete shownReply[id]

  classAdd(replyButton, "option-reply")
  classRemove(replyButton, "option-cancel")

  replyButton.title = "Reply to this comment"

  replyButton = removeAllEventListeners(replyButton)
  onclick(replyButton, globalCommento.replyShow, id)
}

globalCommento.commentCollapse = function (id) {
  let children = $(ID_CHILDREN + id)
  let button = $(ID_COLLAPSE + id)

  if (children) {
    classAdd(children, "hidden")
  }

  classRemove(button, "option-collapse")
  classAdd(button, "option-uncollapse")

  button.title = "Expand children"

  button = removeAllEventListeners(button)
  onclick(button, globalCommento.commentUncollapse, id)
}

globalCommento.commentUncollapse = function (id) {
  let children = $(ID_CHILDREN + id)
  let button = $(ID_COLLAPSE + id)

  if (children) {
    classRemove(children, "hidden")
  }

  classRemove(button, "option-uncollapse")
  classAdd(button, "option-collapse")

  button.title = "Collapse children"

  button = removeAllEventListeners(button)
  onclick(button, globalCommento.commentCollapse, id)
}

function parentMap(comments) {
  let m = {}
  comments.forEach(function (comment) {
    let parentHex = comment.parentHex
    if (!(parentHex in m)) {
      m[parentHex] = []
    }

    comment.creationDate = new Date(comment.creationDate)

    m[parentHex].push(comment)
    commentsMap[comment.commentHex] = {
      html: comment.html,
      markdown: comment.markdown,
    }
  })

  return m
}

function commentsRender() {
  let commentsArea = $(ID_COMMENTS_AREA)
  commentsArea.innerHTML = ""

  let cards = commentsRecurse(parentMap(comments), "root")
  if (cards) {
    append(commentsArea, cards)
  }
}

function submitAuthenticated(id) {
  if (isAuthenticated) {
    globalCommento.commentNew(id, commenterTokenGet())
    return
  }

  globalCommento.loginBoxShow(id)
  return
}

function submitAnonymous(id) {
  chosenAnonymous = true
  globalCommento.commentNew(id, "anonymous")
}

function submitAccountDecide(id) {
  if (requireIdentification) {
    submitAuthenticated(id)
    return
  }

  let anonymousCheckbox = $(ID_ANONYMOUS_CHECKBOX + id)
  let textarea = $(ID_TEXTAREA + id)
  let markdown = textarea.value

  if (markdown === "") {
    classAdd(textarea, "red-border")
    return
  } else {
    classRemove(textarea, "red-border")
  }

  if (!anonymousCheckbox.checked) {
    submitAuthenticated(id)
    return
  } else {
    submitAnonymous(id)
    return
  }
}

// OAuth logic
globalCommento.commentoAuth = function (data) {
  let provider = data.provider
  let id = data.id
  let popup = window.open("", "_blank")

  get(origin + "/api/commenter/token/new", function (resp) {
    if (!resp.success) {
      errorShow(resp.message)
      return
    } else {
      errorHide()
    }

    cookieSet("commentoCommenterToken", resp.commenterToken)

    popup.location =
      origin +
      "/api/oauth/" +
      provider +
      "/redirect?commenterToken=" +
      resp.commenterToken

    let interval = setInterval(function () {
      if (popup.closed) {
        clearInterval(interval)
        selfGet(function () {
          let loggedContainer = $(ID_LOGGED_CONTAINER)
          if (loggedContainer) {
            attrSet(loggedContainer, "style", "")
          }

          if (commenterTokenGet() !== "anonymous") {
            remove($(ID_LOGIN))
          }

          if (id !== null) {
            globalCommento.commentNew(id, resp.commenterToken, function () {
              globalCommento.loginBoxClose()
              commentsGet(commentsRender)
            })
          } else {
            globalCommento.loginBoxClose()
            commentsGet(commentsRender)
          }
        })
      }
    }, 250)
  })
}

function refreshAll(callback) {
  $(ID_ROOT).innerHTML = ""
  shownReply = {}
  globalCommento.main(callback)
}

function loginBoxCreate() {
  let loginBoxContainer = create("div")

  loginBoxContainer.id = ID_LOGIN_BOX_CONTAINER

  append(root, loginBoxContainer)
}

globalCommento.popupRender = function (id) {
  let loginBoxContainer = $(ID_LOGIN_BOX_CONTAINER)
  let loginBox = create("div")
  let ssoSubtitle = create("div")
  let ssoButtonContainer = create("div")
  let ssoButton = create("div")
  let hr1 = create("hr")
  let oauthSubtitle = create("div")
  let oauthButtonsContainer = create("div")
  let oauthButtons = create("div")
  let hr2 = create("hr")
  let emailSubtitle = create("div")
  let emailContainer = create("div")
  let email = create("div")
  let emailInput = create("input")
  let emailButton = create("button")
  let forgotLinkContainer = create("div")
  let forgotLink = create("a")
  let loginLinkContainer = create("div")
  let loginLink = create("a")
  let close = create("div")

  loginBox.id = ID_LOGIN_BOX
  emailSubtitle.id = ID_LOGIN_BOX_EMAIL_SUBTITLE
  emailInput.id = ID_LOGIN_BOX_EMAIL_INPUT
  emailButton.id = ID_LOGIN_BOX_EMAIL_BUTTON
  forgotLinkContainer.id = ID_LOGIN_BOX_FORGOT_LINK_CONTAINER
  loginLinkContainer.id = ID_LOGIN_BOX_LOGIN_LINK_CONTAINER
  ssoButtonContainer.id = ID_LOGIN_BOX_SSO_BUTTON_CONTAINER
  ssoSubtitle.id = ID_LOGIN_BOX_SSO_PRETEXT
  hr1.id = ID_LOGIN_BOX_HR1
  oauthSubtitle.id = ID_LOGIN_BOX_OAUTH_PRETEXT
  oauthButtonsContainer.id = ID_LOGIN_BOX_OAUTH_BUTTONS_CONTAINER
  hr2.id = ID_LOGIN_BOX_HR2

  classAdd(loginBoxContainer, "login-box-container")
  classAdd(loginBox, "login-box")
  classAdd(emailSubtitle, "login-box-subtitle")
  classAdd(emailContainer, "email-container")
  classAdd(email, "email")
  classAdd(emailInput, "input")
  classAdd(emailButton, "email-button")
  classAdd(forgotLinkContainer, "forgot-link-container")
  classAdd(forgotLink, "forgot-link")
  classAdd(loginLinkContainer, "login-link-container")
  classAdd(loginLink, "login-link")
  classAdd(ssoSubtitle, "login-box-subtitle")
  classAdd(ssoButtonContainer, "oauth-buttons-container")
  classAdd(ssoButton, "oauth-buttons")
  classAdd(oauthSubtitle, "login-box-subtitle")
  classAdd(oauthButtonsContainer, "oauth-buttons-container")
  classAdd(oauthButtons, "oauth-buttons")
  classAdd(close, "login-box-close")
  classAdd(root, "root-min-height")

  forgotLink.innerText = "Forgot your password?"
  loginLink.innerText = "Don't have an account? Sign up."
  emailSubtitle.innerText = "Login with your email address"
  emailButton.innerText = "Continue"
  oauthSubtitle.innerText = "Proceed with social login"
  ssoSubtitle.innerText =
    "Proceed with " + parent.location.host + " authentication"

  onclick(emailButton, globalCommento.passwordAsk, id)
  onclick(forgotLink, globalCommento.forgotPassword, id)
  onclick(loginLink, globalCommento.popupSwitch, id)
  onclick(close, globalCommento.loginBoxClose)

  attrSet(loginBoxContainer, "style", "display: none; opacity: 0;")
  attrSet(emailInput, "name", "email")
  attrSet(emailInput, "placeholder", "Email address")
  attrSet(emailInput, "type", "text")

  let numOauthConfigured = 0
  let oauthProviders = ["google", "twitter", "github", "gitlab"]
  oauthProviders.forEach(function (provider) {
    if (configuredOauths[provider]) {
      let button = create("button")

      classAdd(button, "button")
      classAdd(button, provider + "-button")

      button.innerText = provider

      onclick(button, globalCommento.commentoAuth, {
        provider: provider,
        id: id,
      })

      append(oauthButtons, button)
      numOauthConfigured++
    }
  })

  if (configuredOauths["sso"]) {
    let button = create("button")

    classAdd(button, "button")
    classAdd(button, "sso-button")

    button.innerText = "Single Sign-On"

    onclick(button, globalCommento.commentoAuth, { provider: "sso", id: id })

    append(ssoButton, button)
    append(ssoButtonContainer, ssoButton)
    append(loginBox, ssoSubtitle)
    append(loginBox, ssoButtonContainer)

    if (numOauthConfigured > 0 || configuredOauths["commento"]) {
      append(loginBox, hr1)
    }
  }

  if (numOauthConfigured > 0) {
    append(loginBox, oauthSubtitle)
    append(oauthButtonsContainer, oauthButtons)
    append(loginBox, oauthButtonsContainer)
    oauthButtonsShown = true
  } else {
    oauthButtonsShown = false
  }

  append(email, emailInput)
  append(email, emailButton)
  append(emailContainer, email)

  append(forgotLinkContainer, forgotLink)

  append(loginLinkContainer, loginLink)

  if (numOauthConfigured > 0 && configuredOauths["commento"]) {
    append(loginBox, hr2)
  }

  if (configuredOauths["commento"]) {
    append(loginBox, emailSubtitle)
    append(loginBox, emailContainer)
    append(loginBox, forgotLinkContainer)
    append(loginBox, loginLinkContainer)
  }

  append(loginBox, close)

  popupBoxType = "login"
  loginBoxContainer.innerHTML = ""
  append(loginBoxContainer, loginBox)
}

globalCommento.forgotPassword = function () {
  let popup = window.open("", "_blank")
  popup.location = origin + "/forgot?commenter=true"
  globalCommento.loginBoxClose()
}

globalCommento.popupSwitch = function (id) {
  let emailSubtitle = $(ID_LOGIN_BOX_EMAIL_SUBTITLE)

  if (oauthButtonsShown) {
    remove($(ID_LOGIN_BOX_OAUTH_BUTTONS_CONTAINER))
    remove($(ID_LOGIN_BOX_OAUTH_PRETEXT))
    remove($(ID_LOGIN_BOX_HR1))
    remove($(ID_LOGIN_BOX_HR2))
  }

  if (configuredOauths["sso"]) {
    remove($(ID_LOGIN_BOX_SSO_BUTTON_CONTAINER))
    remove($(ID_LOGIN_BOX_SSO_PRETEXT))
    remove($(ID_LOGIN_BOX_HR1))
    remove($(ID_LOGIN_BOX_HR2))
  }

  remove($(ID_LOGIN_BOX_LOGIN_LINK_CONTAINER))
  remove($(ID_LOGIN_BOX_FORGOT_LINK_CONTAINER))

  emailSubtitle.innerText = "Create an account"
  popupBoxType = "signup"
  globalCommento.passwordAsk(id)
  $(ID_LOGIN_BOX_EMAIL_INPUT).focus()
}

function loginUP(username, password, id) {
  let json = {
    email: username,
    password: password,
  }

  post(origin + "/api/commenter/login", json, function (resp) {
    if (!resp.success) {
      globalCommento.loginBoxClose()
      errorShow(resp.message)
      return
    } else {
      errorHide()
    }

    cookieSet("commentoCommenterToken", resp.commenterToken)

    selfLoad(resp.commenter, resp.email)
    allShow()

    remove($(ID_LOGIN))
    if (id !== null) {
      globalCommento.commentNew(id, resp.commenterToken, function () {
        globalCommento.loginBoxClose()
        commentsGet(commentsRender)
      })
    } else {
      globalCommento.loginBoxClose()
      commentsGet(commentsRender)
    }
  })
}

globalCommento.login = function (id) {
  let email = $(ID_LOGIN_BOX_EMAIL_INPUT)
  let password = $(ID_LOGIN_BOX_PASSWORD_INPUT)

  loginUP(email.value, password.value, id)
}

globalCommento.signup = function (id) {
  let email = $(ID_LOGIN_BOX_EMAIL_INPUT)
  let name = $(ID_LOGIN_BOX_NAME_INPUT)
  let website = $(ID_LOGIN_BOX_WEBSITE_INPUT)
  let password = $(ID_LOGIN_BOX_PASSWORD_INPUT)

  let json = {
    email: email.value,
    name: name.value,
    website: website.value,
    password: password.value,
  }

  post(origin + "/api/commenter/new", json, function (resp) {
    if (!resp.success) {
      globalCommento.loginBoxClose()
      errorShow(resp.message)
      return
    } else {
      errorHide()
    }

    loginUP(email.value, password.value, id)
  })
}

globalCommento.passwordAsk = function (id) {
  let loginBox = $(ID_LOGIN_BOX)
  let subtitle = $(ID_LOGIN_BOX_EMAIL_SUBTITLE)

  remove($(ID_LOGIN_BOX_EMAIL_BUTTON))
  remove($(ID_LOGIN_BOX_LOGIN_LINK_CONTAINER))
  remove($(ID_LOGIN_BOX_FORGOT_LINK_CONTAINER))
  if (oauthButtonsShown) {
    if (configuredOauths.length > 0) {
      remove($(ID_LOGIN_BOX_HR1))
      remove($(ID_LOGIN_BOX_HR2))
      remove($(ID_LOGIN_BOX_OAUTH_PRETEXT))
      remove($(ID_LOGIN_BOX_OAUTH_BUTTONS_CONTAINER))
    }
  }

  let order, fid, type, placeholder

  if (popupBoxType === "signup") {
    order = ["name", "website", "password"]
    fid = [
      ID_LOGIN_BOX_NAME_INPUT,
      ID_LOGIN_BOX_WEBSITE_INPUT,
      ID_LOGIN_BOX_PASSWORD_INPUT,
    ]
    type = ["text", "text", "password"]
    placeholder = ["Real Name", "Website (Optional)", "Password"]
  } else {
    order = ["password"]
    fid = [ID_LOGIN_BOX_PASSWORD_INPUT]
    type = ["password"]
    placeholder = ["Password"]
  }

  if (popupBoxType === "signup") {
    subtitle.innerText = "Finish the rest of your profile to complete."
  } else {
    subtitle.innerText = "Enter your password to log in."
  }

  for (let i = 0; i < order.length; i++) {
    let fieldContainer = create("div")
    let field = create("div")
    let fieldInput = create("input")

    fieldInput.id = fid[i]

    classAdd(fieldContainer, "email-container")
    classAdd(field, "email")
    classAdd(fieldInput, "input")

    attrSet(fieldInput, "name", order[i])
    attrSet(fieldInput, "type", type[i])
    attrSet(fieldInput, "placeholder", placeholder[i])

    append(field, fieldInput)
    append(fieldContainer, field)

    if (order[i] === "password") {
      let fieldButton = create("button")
      classAdd(fieldButton, "email-button")
      fieldButton.innerText = popupBoxType

      if (popupBoxType === "signup") {
        onclick(fieldButton, globalCommento.signup, id)
      } else {
        onclick(fieldButton, globalCommento.login, id)
      }

      append(field, fieldButton)
    }

    append(loginBox, fieldContainer)
  }

  if (popupBoxType === "signup") {
    $(ID_LOGIN_BOX_NAME_INPUT).focus()
  } else {
    $(ID_LOGIN_BOX_PASSWORD_INPUT).focus()
  }
}

function pageUpdate(callback) {
  let attributes = {
    isLocked: isLocked,
    stickyCommentHex: stickyCommentHex,
  }

  let json = {
    commenterToken: commenterTokenGet(),
    domain: parent.location.host,
    path: pageId,
    attributes: attributes,
  }

  post(origin + "/api/page/update", json, function (resp) {
    if (!resp.success) {
      errorShow(resp.message)
      return
    } else {
      errorHide()
    }

    call(callback)
  })
}

globalCommento.threadLockToggle = function () {
  let lock = $(ID_MOD_TOOLS_LOCK_BUTTON)

  isLocked = !isLocked

  lock.disabled = true
  pageUpdate(function () {
    lock.disabled = false
    refreshAll()
  })
}

globalCommento.commentSticky = function (commentHex) {
  if (stickyCommentHex !== "none") {
    let sticky = $(ID_STICKY + stickyCommentHex)
    classRemove(sticky, "option-unsticky")
    classAdd(sticky, "option-sticky")
  }

  if (stickyCommentHex === commentHex) {
    stickyCommentHex = "none"
  } else {
    stickyCommentHex = commentHex
  }

  pageUpdate(function () {
    let sticky = $(ID_STICKY + commentHex)
    if (stickyCommentHex === commentHex) {
      classRemove(sticky, "option-sticky")
      classAdd(sticky, "option-unsticky")
    } else {
      classRemove(sticky, "option-unsticky")
      classAdd(sticky, "option-sticky")
    }
  })
}

function mainAreaCreate() {
  let mainArea = create("div")

  mainArea.id = ID_MAIN_AREA

  classAdd(mainArea, "main-area")

  attrSet(mainArea, "style", "display: none")

  append(root, mainArea)
}

function modToolsCreate() {
  let modTools = create("div")
  let lock = create("button")

  modTools.id = ID_MOD_TOOLS
  lock.id = ID_MOD_TOOLS_LOCK_BUTTON

  classAdd(modTools, "mod-tools")

  if (isLocked) {
    lock.innerHTML = "Unlock Thread"
  } else {
    lock.innerHTML = "Lock Thread"
  }

  onclick(lock, globalCommento.threadLockToggle)

  attrSet(modTools, "style", "display: none")

  append(modTools, lock)
  append(root, modTools)
}

function allShow() {
  let mainArea = $(ID_MAIN_AREA)
  let modTools = $(ID_MOD_TOOLS)
  let loggedContainer = $(ID_LOGGED_CONTAINER)

  attrSet(mainArea, "style", "")

  if (isModerator) {
    attrSet(modTools, "style", "")
  }

  if (loggedContainer) {
    attrSet(loggedContainer, "style", "")
  }
}

globalCommento.loginBoxClose = function () {
  let mainArea = $(ID_MAIN_AREA)
  let loginBoxContainer = $(ID_LOGIN_BOX_CONTAINER)

  classRemove(mainArea, "blurred")
  classRemove(root, "root-min-height")

  attrSet(loginBoxContainer, "style", "display: none")
}

globalCommento.loginBoxShow = function (id) {
  let mainArea = $(ID_MAIN_AREA)
  let loginBoxContainer = $(ID_LOGIN_BOX_CONTAINER)

  globalCommento.popupRender(id)

  classAdd(mainArea, "blurred")

  attrSet(loginBoxContainer, "style", "")

  window.location.hash = ID_LOGIN_BOX_CONTAINER

  $(ID_LOGIN_BOX_EMAIL_INPUT).focus()
}

function loadHash() {
  if (window.location.hash) {
    if (window.location.hash.startsWith("#commento-")) {
      let el = $(ID_CARD + window.location.hash.split("-")[1])
      if (el === null) {
        return
      }

      classAdd(el, "highlighted-card")
      el.scrollIntoView(true)
    } else if (window.location.hash.startsWith("#commento")) {
      root.scrollIntoView(true)
    }
  }
}

globalCommento.main = function (callback, url) {
  origin = cdn = url
  root = $(ID_ROOT)
  if (root === null) {
    console.log(
      "[commento] error: no root element with ID '" + ID_ROOT + "' found"
    )
    return
  }

  if (mobileView === null) {
    mobileView = root.getBoundingClientRect()["width"] < 450
  }

  classAdd(root, "root")

  loginBoxCreate()

  errorElementCreate()

  mainAreaCreate()

  let footer = footerLoad()

  selfGet(function () {
    commentsGet(function () {
      modToolsCreate()
      rootCreate(function () {
        commentsRender()
        append(root, footer)
        loadHash()
        allShow()
        nameWidthFix()
        call(callback)
      })
    })
  })
}
