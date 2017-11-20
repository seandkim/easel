from bs4 import BeautifulSoup

html = """
<html>
 <head>
  <title>
   The Dormouse's story
  </title>
 </head>
 <body>
  <p class="title">
   <b>
    The Dormouse's story
   </b>
  </p>
  <p class="story">
   Once upon a time there were three little sisters; and their names were
   <a class="sister" href="http://example.com/elsie" id="link1">
    Elsie
   </a>
   ,
   <a class="sister" href="http://example.com/lacie" id="link2">
    Lacie
   </a>
   and
   <a class="sister" href="http://example.com/tillie" id="link3">
    Tillie
   </a>
   ;
and they lived at the bottom of a well.
  </p>
  <p class="ud title">
   hello
  </p>
  <div contenteditable="true">
  </div>
  <div hello="1"></div>
  <a href="google.com"></a>
  </body>
  </html>
"""

soup = BeautifulSoup(html, "html.parser")
print(soup.prettify())



html2 = '<div contenteditable="true"></div>\
        <td width="580" valign="top">hello1</td>\
        <td>hello2</td>'

soup2 = BeautifulSoup(html2, "html.parser")








