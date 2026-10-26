# Say It Clearly

A custom HTML, CSS, and JavaScript course published as a SCORM 1.2 package, with an xAPI statement stream. Built by Koketso Mabuela for application SA_1262.

The course is a ten-minute feedback module: a branching conversation, a knowledge check with a mastery score of 67, and suspend/resume. The page around it is a small LMS runtime, so a reviewer can watch the SCORM data model and the xAPI statements update while taking the course.

## Launch

Open the course at [https://koketsomabuela92.github.io/say-it-clearly/](https://koketsomabuela92.github.io/say-it-clearly/).

To run it locally:

```bash
python3 -m http.server 8765
```

Then open [http://127.0.0.1:8765/](http://127.0.0.1:8765/) and choose **Launch course**.

## LMS import

[`SA_1262_SayItClearly.zip`](SA_1262_SayItClearly.zip) is the upload package. `imsmanifest.xml` is at the root of the zip. Moodle, Cornerstone, and SuccessFactors can import it as a SCORM 1.2 SCO.

The source for that package is the [`scorm`](scorm) folder.
