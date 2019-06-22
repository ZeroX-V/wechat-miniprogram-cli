#!/usr/bin/env node

'use strict';
const program = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
console.log(process.argv);
program
    .command('page <pageName>')
    .action((pageName, options) => {

        createPage(pageName);
    });

program.parse(process.argv);


// Prints: /Users/mjr
function createPage(pageName) {
    pageName = pageName.replace("/", "\\");
    let configFileName = "project.config.json";
    let dirPath = path.join(process.cwd());
    let configPath = path.join(dirPath, configFileName);
    fs.exists(configPath, (exists) => {
        if (exists) {
            fs.readFile(configPath, 'utf-8', function (err, data) {
                if (err) {
                    console.log(chalk.red("读取project.config.json失败"));
                    process.exit(1);
                } else {
                    let miniprogramRoot = path.join(dirPath, JSON.parse(data).miniprogramRoot);
                    let appJsonPath = path.join(miniprogramRoot, "app.json");
                    //读取app配置文件

                    let pageDir = path.join(miniprogramRoot, "pages", pageName);
                    var pageNameArray = pageName.split('\\');


                    var result = fs.ensureDirSync(pageDir);
                    if (!result) {
                        console.log(chalk.red("当前文件夹已经存在，请删除后继续。" + pageDir));
                        process.exit(1);
                    }
                    var templateFilePath = path.join(__dirname, "template");
                    var files = fs.readdirSync(templateFilePath);
                    console.log("开始生成文件");
                    for (let index = 0; index < files.length; index++) {
                        let item = files[index];
                        var newFilePath = path.join(pageDir, item.replace("template", pageNameArray[pageNameArray.length - 1]));
                        fs.copyFile(path.join(templateFilePath, item), newFilePath);
                        console.log(newFilePath);
                    }
                    console.log("文件生成完成");
                    console.log("开始写入app.json");

                    fs.readFile(appJsonPath, function (err, data) {
                        if (err) {
                            console.log(chalk.red("读取app.json失败"));
                            process.exit(1);
                        } else {
                            let appJsonData = JSON.parse(data);
                            let pages = appJsonData.pages;

                            var isHas = true;
                            for (let index = 0; index < pages.length; index++) {
                                let item = pages[index];
                                if (item == newFilePath) {
                                    isHas = false;
                                    break;
                                }
                            }
                            if (isHas) {
                                pages.push("pages/" + pageName.replace("\\", "/") + "/" + pageNameArray[pageNameArray.length - 1]);
                            }

                            fs.outputFile(appJsonPath, JSON.stringify(appJsonData,null,2), function (err) {
                                if (err) {
                                    console.log(chalk.red("写入app.json出错了"));
                                } else {
                                    console.log("写入app.json完成");
                                    console.log("页面已经生成成功");
                                }
                            })
                        }

                    });
                 
                   
                    
                }
            });
        } else {

            console.log(chalk.red("请在小程序根目录运行此命令"));
            process.exit(1);
        }

    });


};

