from bs4 import BeautifulSoup

html = """
<!DOCTYPE html>
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
  <p class="ud title">
   hello
  </p>
  <div contenteditable="true">
    <p>hello</p>
  </div>
  <div id="1"></div>
  <a href="google.com"></a>
  </body>
  </html>
"""

soup = BeautifulSoup(html, "html.parser")

def confirm(elem): 
  if elem.name != 'div': 
    return False

  print(elem)

  try: 
    return elem['contenteditable'] == 'true'
  except: 
    return False

res = soup.find_all(confirm)
for e in res: 
  e['contenteditable'] = 'false'
print(res)
print(soup.prettify())


# def confirm(tag): 
#   try: 
#     print(tag.attrs)
#     print(tag['valign'] == 'top')
#     return tag['valign'] == 'top'
#   except: 
#     return False

# html2 = '<td width="580" valign="top">hello1</td>\
#         <td valign="top">hello2</td>'

# soup2 = BeautifulSoup(html2, "html.parser")

# print(soup2.find_all('td', {'valign', 'top'}))

# td_tag_list = soup2.find_all(confirm)
# print(td_tag_list)





