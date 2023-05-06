import { v4 as uuidv4 } from 'uuid'
import aes256 from 'aes256'

import { getToday, sortByKey, isWhiteSpace } from './utils'


class DataGroup {
  constructor(group, defaultFunc) {
    this.defaultFunc = defaultFunc
    this.group = group
    this.data = {}
    this.block = {}
    this.invalidVersionIsDetected = false
  }

  async load(key, hsc, api, profile) {
    // Do nothing if key is already loaded
    if (key in this.data) {
      return
    }

    // Downloaded block JSON
    let blockJson = null;

    // Try to load block
    try {
      blockJson = null
      blockJson = await profile.getBlockJson(api, this.group, key)
    } catch (err) {
      if (err.status != 404) {
        throw err
      }
    }

    // Set data and block
    if (blockJson == null) {
      this.block[key] = hsc.Block.new(
        profile.publicKey(), this.group, key
      )
      this.data[key] = {}
      this._setBlockFromData(key, profile)
    } else {
      this.block[key] = hsc.Block.fromBlockJson(blockJson)
      this._setDataFromBlock(key, profile)
    }

    // Ensure default data
    if (Object.keys(this.data[key]).length == 0) {
      this._setDefaultData(key)
      this._setBlockFromData(key, profile)
      await this.block[key].save(api, profile)
    }
  }

  async save(key, api, profile) {
    if (this.invalidVersionIsDetected) {
      this._sendInvalidVersionEvent()
      throw "Invalid version detected"
    }

    if (Object.keys(this.data[key]).length == 0) {
      this._setDefaultData(key)
    }

    this._setBlockFromData(key, profile)

    try {
      await this.block[key].save(api, profile)
    } catch (err) {
      // If status 412 (invalid version) generate an event
      if (err.status == 412) {
        this.invalidVersionIsDetected = true
        this._sendInvalidVersionEvent()
      }
      throw err
    }
  }

  _setDefaultData(key) {
    this.data[key] = this.defaultFunc(key)
  }

  _setDataFromBlock(key, profile) {
    const decrypted = aes256.decrypt(
      profile.privateKey(),
      this.block[key].data()
    )
    this.data[key] = JSON.parse(decrypted)
  }

  _setBlockFromData(key, profile) {
    const decrypted = JSON.stringify(this.data[key])
    const encrypted = aes256.encrypt(profile.privateKey(), decrypted)
    this.block[key].setData(encrypted)
  }

  _sendInvalidVersionEvent() {
    const event = document.createEvent("Event")
    event.initEvent('hs-invalid-version', true, true)
    document.dispatchEvent(event)
  }
}


export default class AppState {
  constructor() {
    // Parameters
    this.hsc = null
    this.api = null
    this.profile = null

    // Groups
    this.diariesGroup = null
    this.optionsGroup = null
    this.notesGroup = null
    this.textsGroup = null

    // Initialized
    this.isInitialized = false
  }

  initialize(hsc, api, profile) {
    this.hsc = hsc
    this.api = api
    this.profile = profile
  }

  async load() {
    // Diaries
    this.diariesGroup = new DataGroup(
      "base", 
      () => {
        const id = uuidv4()
        const data = {}
        data[id] = {
          id,
          name: "Main",
        }
        return data
      }
    )
    await this.diariesGroup.load("diaries", this.hsc, this.api, this.profile)

    // Options
    this.optionsGroup = new DataGroup(
      "base", 
      () => {
        const activeDiary = Object.keys(this.diariesGroup.data["diaries"])[0]
        return {
          activeDiary,
          activeNote: null,
        }
      }
    )
    await this.optionsGroup.load("options", this.hsc, this.api, this.profile)

    // Notes
    this.notesGroup = new DataGroup(
      "notes", 
      () => {
        const id = uuidv4()
        const data = {}
        data[id] = {
          id,
          date: getToday(),
        }
        return data
      }
    )
    await this.notesGroup.load(
      this.optionsGroup.data["options"].activeDiary, 
      this.hsc, this.api, this.profile
    )

    // Ensure activeNote
    if (this.optionsGroup.data["options"].activeNote === null) {
      const activeDiary = this.optionsGroup.data["options"].activeDiary
      this.optionsGroup.data["options"].activeNote = Object.keys(this.notesGroup.data[activeDiary])[0]
      await this.optionsGroup.save("options", this.api, this.profile)
    }

    // Texts
    this.textsGroup = new DataGroup(
      "texts", 
      () => {
        return {
          text: ""
        }
      }
    )
    await this.textsGroup.load(
      this.optionsGroup.data["options"].activeNote, 
      this.hsc, this.api, this.profile
    )

    // Set initialized
    this.isInitialized = true
  }

  async exists(api, profile) {
    try {
      await profile.getBlockJson(api, "base", "diaries")
      return true
    } catch (err) {
      if (err.status != 404) {
        throw err
      }
      return false
    }
  }

  getDiaries() {
    const diaries = Object.values(this.diariesGroup.data["diaries"])
    return sortByKey(diaries, 'name')
  }

  getActiveDiaryId() {
    return this.optionsGroup.data["options"].activeDiary
  }

  getActiveDiary() {
    const activeDiaryId = this.getActiveDiaryId()
    return this.diariesGroup.data["diaries"][activeDiaryId]
  }

  getDiaryById(diaryId) {
    return this.diariesGroup.data["diaries"][diaryId]
  }

  getNotes() {
    const activeDiaryId = this.getActiveDiaryId()
    const notes = Object.values(this.notesGroup.data[activeDiaryId])
    return sortByKey(notes, 'date', true)
  }

  getActiveNoteId() {
    return this.optionsGroup.data["options"].activeNote
  }

  getActiveNote() {
    const activeDiaryId = this.getActiveDiaryId()
    const activeNoteId = this.getActiveNoteId()
    return this.notesGroup.data[activeDiaryId][activeNoteId]
  }

  getNoteById(noteId) {
    const activeDiaryId = this.getActiveDiaryId()
    return this.notesGroup.data[activeDiaryId][noteId]
  }

  async setActiveDiary(diaryId) {
    await this.notesGroup.load(diaryId, this.hsc, this.api, this.profile)

    this.optionsGroup.data["options"].activeDiary = diaryId
    const activeNoteId = this.getNotes()[0].id    
    this.optionsGroup.data["options"].activeNote = activeNoteId

    await Promise.all([
      this.textsGroup.load(activeNoteId, this.hsc, this.api, this.profile),
      this.optionsGroup.save("options", this.api, this.profile),
    ])
  }

  async saveDiary(name, diaryId) {
    if (diaryId) {
      this.diariesGroup.data["diaries"][diaryId].name = name
    } else {
      diaryId = uuidv4()
      this.diariesGroup.data["diaries"][diaryId] = {
        id: diaryId,
        name,
      }
    }
    await this.diariesGroup.save("diaries", this.api, this.profile)
    return diaryId
  }

  async deleteDiary(diaryId) {
    // Set texts to empty
    const textPromises = []
    for (const noteId in this.notesGroup.data[diaryId]) {
      textPromises.push(async () => {
        if (!(noteId in this.textsGroup.data)) {
          await this.textsGroup.load(noteId, this.hsc, this.api, this.profile)
        }
        this.textsGroup.data[noteId].text = ""
        await this.textsGroup.save(noteId, this.api, this.profile)
      })
    }
    await Promise.all(textPromises)

    // Clear notes
    this.notesGroup.data[diaryId] = {}
    delete this.diariesGroup.data["diaries"][diaryId]

    await Promise.all([
      this.notesGroup.save(diaryId, this.api, this.profile),
      this.diariesGroup.save("diaries", this.api, this.profile)
    ])

    // Set active diary
    if (diaryId == this.getActiveDiaryId()) {  
      const newActiveDiaryId = this.getDiaries()[0].id
      await this.setActiveDiary(newActiveDiaryId)
    }
  }

  async setActiveNote(noteId, deleteNoteWithEmptyText) {
    const oldNoteId = this.getActiveNoteId()

    if (oldNoteId != noteId) {
      this.optionsGroup.data["options"].activeNote = noteId

      let promises = [
        this.optionsGroup.save("options", this.api, this.profile),
        this.textsGroup.load(noteId, this.hsc, this.api, this.profile),
      ]

      // Delete note if empty text inside
      if (deleteNoteWithEmptyText) {
        const oldText = this.textsGroup.data[oldNoteId].text
        if (isWhiteSpace(oldText)) {
          promises.push(this.deleteNote(oldNoteId))
        }
      }

      await Promise.all(promises)
    }
  }

  async saveNote(date, noteId) {
    const activeDiaryId = this.getActiveDiaryId()
    if (noteId) {
      this.notesGroup.data[activeDiaryId][noteId].date = date
    } else {
      noteId = uuidv4()
      this.notesGroup.data[activeDiaryId][noteId] = {
        id: noteId,
        date,
      }
    }
    await this.notesGroup.save(activeDiaryId, this.api, this.profile)
    return noteId
  }

  async deleteNote(noteId) {
    const activeDiaryId = this.getActiveDiaryId()

    delete this.notesGroup.data[activeDiaryId][noteId]
    this.textsGroup.data[noteId].text = ""

    await Promise.all([
      this.notesGroup.save(activeDiaryId, this.api, this.profile),
      this.textsGroup.save(noteId, this.api, this.profile),
    ])

    if (noteId == this.getActiveNoteId()) {  
      const newActiveNoteId = this.getNotes()[0].id
      await this.setActiveNote(newActiveNoteId, false)
    }    
  }

  getActiveText() {
    const activeNoteId = this.getActiveNoteId()
    return this.textsGroup.data[activeNoteId].text
  }

  async saveActiveText(text) {
    const activeNoteId = this.getActiveNoteId()
    this.textsGroup.data[activeNoteId].text = text
    await this.textsGroup.save(activeNoteId, this.api, this.profile)
  }
}
