Project Specification Feedback
==================

Commit graded: f853deca0f6caede7087e36fb1e4761238180468

### The product backlog (10/10)

A spreadsheet format is easier to read for backlogs. You should look into existing online tools for generating, assigning, and tracking work on a project

Please estimate a cost in hours for each feature. This is a good way to see if a feature needs to be broken down into smaller pieces. If the cost estimate is more than 8 hours, think about how you can separate it into smaller work units.

It seems that you introduced the inbox/messaging feature in the project specifications and it was not present in your original proposal. Had this feature been in your original proposal, we would have warned you that it was not cohesive with the rest of the application and we would have asked you to remove it from your project. Be sure that all team members have an opportunity to demonstrate their web application development skills related to server-side interactions after you remove the inbox feature--it looks like Tiffany's main server-side responsibilities were related to
the inbox/messaging features.

### Data models (10/10)

Your Sites model should have a ForeignKey field to the Profile, similar to the Project model. The methods you are describing in your model classes correspond directly to easy-to-use, existing
ORM functionality.From their existing models it's not very clear how the back-end server is storing enough informationto record the layout for elements of a page.

### Wireframes or mock-ups (10/10)

Your wireframes show project categories, such as "Illustration" and "Architecture" and a Status. These features should be included in your Project model.  

### Additional Information

---
#### Total score (30/30)
---
Graded by: Anni Zhang (anniz@andrew.cmu.edu)

To view this file with formatting, visit the following page: https://github.com/CMU-Web-Application-Development/277/blob/master/feedback/specification-feedback.md
