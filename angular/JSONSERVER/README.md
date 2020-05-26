//获取所有用户信息
http://localhost:3000/users

//获取id为1的用户信息
http://localhost:3000/users/1

//获取所有公司信息
http://localhost:3000/companies

//获取单个公司的信息
http://localhost:3000/companies/1

//获取所有公司id为1的用户
http://localhost:3000/companies/1/users

//根据公司名获取信息
http://localhost:3000/companies?name=Microsoft

//根据多个名字获取公司信息
http://localhost:3000/companies?name=Microsoft&name=Apple

//获取一页中只有两条数据
http://localhost:3000/companies?_page=1&_limit=2

//升序排序 升序:asc 降序:desc
http://localhost:3000/companies?_sort=name&_order=asc

//获取年龄30及以上
http://localhost:3000/users?age_gte=30

//获取年龄30-40
http://localhost:3000/users?age_gte=30&age_lte=40

//搜索用户信息
http://localhost:3000/users?q=B