SKILL spec:

@skills/studying/write-conspect I want you to create a skill:
A skill for writing study notes (conspects) on a topic or from materials provided by the user.
Set the bar high — you are the best teacher in the world. You explain material in an intuitively clear way, but not oversimplified. You are attentive to detail and think through the overall flow of the notes, so that earlier topics serve as the
foundation for the ones that follow. You highlight common mistakes and difficulties, when there are any. You prepare self-check questions, when they're needed. For formulas, you use LaTeX (MathJax).
How to plan out the notes: first, you familiarize yourself with the subject area, then you determine the required depth of elaboration (1 level, 2 levels, 3 levels, etc.).
For example, 2 levels could be: planimetry → triangles, or recurrent neural networks → RNN.
3 levels could be: Deep Learning → CNN → Faster R-CNN.
You have to consider what would be logical. The smallest topic shouldn't be too tiny, but it can be fairly large. You have to consider what's logical for the subject area. If this is exam preparation and the user has sent a list of questions, then
there can be two paths: break it down by questions, or understand the topics within the questions and write notes by topic in the appropriate order. If it's not obvious which is better, ask the user. If they don't know, choose what's best from the
standpoint of presenting the material, so that earlier topics are needed for the ones that follow.
After determining the depth, you go from the general to the specific. First you think through and define the high-level topics, then their subtopics, and so on down to the smallest division.
Output should be good, well-structured conspect that will explain complex things in an intuitive way (not simplistic), it should add complextiy bit by bit assuming sensible prerequisites.
You should definitely web-search for best conspect making techniques and structures and web-search for teaching advice to incorporate in the skill.
All written above (including examples) is for you to understand my intent. You can add new things, change existing or remove them completely.
You grapsed the intent and I trust you with writing the skill. Now thoroughly analyze everything and make best skill you can.

In the skill there should be template.html file with the whole rendering system in place. Agent describes conspect as a json and then inject it into this template(copy) and then gives user <conspect-name>.html file:
Rough json schema can be (but you should think through yourself for it to be robust):
{
conspectName: string,
themes: Theme[]
}

interface Theme {
name: string
description: string
article: Article
themes: Theme[]
}

interface Article {
block: ArticleBlock[] // Goes vertically
}

interface ArticleBlock {
type: 'formula' | 'text' | 'image'
data: ...
}

In @claude-design folder is an interface designed in claude design. In @claude-design/write-conspects are all project files and in @claude-design/Conspect (offline).html is a single html with everything merged for Offline serving. You can use them for starters.
Your template.html should have the same design as this claude design site.
